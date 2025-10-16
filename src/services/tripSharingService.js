// Trip sharing and collaboration service
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generate unique 6-digit share code
export const generateShareCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Generate invitation token
export const generateInviteToken = () => {
  return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
};

// Create trip share code
export const createTripShareCode = async (tripId, userId) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data();
    
    // Check if user is trip owner or admin
    if (tripData.createdBy !== userId) {
      const userMember = tripData.members?.find(m => m.userId === userId);
      if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
        throw new Error('Permission denied: Only trip owners/admins can create share codes');
      }
    }
    
    // Generate new share code
    const shareCode = generateShareCode();
    
    // Check if code already exists (very unlikely but possible)
    const existingQuery = query(
      collection(db, 'trips'),
      where('shareCode', '==', shareCode)
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      // Recursively try again with new code
      return createTripShareCode(tripId, userId);
    }
    
    // Update trip with share code
    await updateDoc(tripRef, {
      shareCode,
      isPublic: true,
      shareCodeCreatedAt: new Date(),
      shareCodeCreatedBy: userId,
      updatedAt: new Date()
    });
    
    return {
      shareCode,
      shareUrl: `${window.location.origin}/join/${shareCode}`,
      message: 'Share code created successfully'
    };
    
  } catch (error) {
    console.error('Error creating share code:', error);
    throw error;
  }
};

// Join trip via share code
export const joinTripByCode = async (shareCode, userId, userEmail) => {
  try {
    // Find trip by share code
    const tripsQuery = query(
      collection(db, 'trips'),
      where('shareCode', '==', shareCode.toUpperCase())
    );
    const tripsSnapshot = await getDocs(tripsQuery);
    
    if (tripsSnapshot.empty) {
      throw new Error('Invalid share code: Trip not found');
    }
    
    const tripDoc = tripsSnapshot.docs[0];
    const tripData = tripDoc.data();
    const tripId = tripDoc.id;
    
    // Check if user is already a member
    const existingMember = tripData.members?.find(m => m.userId === userId);
    if (existingMember) {
      return {
        tripId,
        tripName: tripData.name,
        message: 'You are already a member of this trip',
        alreadyMember: true
      };
    }
    
    // Add user as member
    const newMember = {
      userId,
      email: userEmail,
      role: 'member',
      joinedAt: new Date(),
      joinedVia: 'shareCode'
    };
    
    await updateDoc(doc(db, 'trips', tripId), {
      members: arrayUnion(newMember),
      updatedAt: new Date()
    });
    
    return {
      tripId,
      tripName: tripData.name,
      message: `Successfully joined "${tripData.name}"!`,
      alreadyMember: false
    };
    
  } catch (error) {
    console.error('Error joining trip:', error);
    throw error;
  }
};

// Send trip invitation
export const sendTripInvitation = async (tripId, inviterUserId, inviteeEmail, personalMessage = '') => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data();
    
    // Check permissions
    if (tripData.createdBy !== inviterUserId) {
      const userMember = tripData.members?.find(m => m.userId === inviterUserId);
      if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
        throw new Error('Permission denied: Only trip owners/admins can send invitations');
      }
    }
    
    // Check if already invited or member
    const existingInvite = tripData.invitations?.find(inv => inv.email === inviteeEmail);
    const existingMember = tripData.members?.find(m => m.email === inviteeEmail);
    
    if (existingMember) {
      throw new Error('User is already a member of this trip');
    }
    
    if (existingInvite && existingInvite.status === 'pending') {
      throw new Error('Invitation already sent to this email');
    }
    
    // Generate invitation token
    const inviteToken = generateInviteToken();
    
    // Create invitation object
    const invitation = {
      email: inviteeEmail,
      status: 'pending',
      invitedAt: new Date(),
      invitedBy: inviterUserId,
      inviteToken,
      personalMessage,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    // Add invitation to trip
    await updateDoc(tripRef, {
      invitations: arrayUnion(invitation),
      updatedAt: new Date()
    });
    
    // In a real app, we would send email here
    // For now, we'll return the invitation details
    return {
      inviteToken,
      inviteUrl: `${window.location.origin}/invite/${inviteToken}`,
      tripName: tripData.name,
      inviteeEmail,
      message: 'Invitation created successfully'
    };
    
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw error;
  }
};

// Accept trip invitation
export const acceptTripInvitation = async (inviteToken, userId, userEmail) => {
  try {
    // Find trip by invite token
    const tripsQuery = query(collection(db, 'trips'));
    const tripsSnapshot = await getDocs(tripsQuery);
    
    let targetTrip = null;
    let targetInvitation = null;
    
    for (const tripDoc of tripsSnapshot.docs) {
      const tripData = tripDoc.data();
      const invitation = tripData.invitations?.find(inv => inv.inviteToken === inviteToken);
      
      if (invitation) {
        targetTrip = { id: tripDoc.id, ...tripData };
        targetInvitation = invitation;
        break;
      }
    }
    
    if (!targetTrip || !targetInvitation) {
      throw new Error('Invalid invitation token');
    }
    
    // Check if invitation is still valid
    if (targetInvitation.status !== 'pending') {
      throw new Error('Invitation has already been processed');
    }
    
    if (new Date() > targetInvitation.expiresAt.toDate()) {
      throw new Error('Invitation has expired');
    }
    
    if (targetInvitation.email !== userEmail) {
      throw new Error('This invitation was sent to a different email address');
    }
    
    // Check if user is already a member
    const existingMember = targetTrip.members?.find(m => m.userId === userId);
    if (existingMember) {
      throw new Error('You are already a member of this trip');
    }
    
    // Add user as member and update invitation status
    const newMember = {
      userId,
      email: userEmail,
      role: 'member',
      joinedAt: new Date(),
      joinedVia: 'invitation'
    };
    
    // Update invitation status
    const updatedInvitations = targetTrip.invitations.map(inv => 
      inv.inviteToken === inviteToken 
        ? { ...inv, status: 'accepted', acceptedAt: new Date() }
        : inv
    );
    
    await updateDoc(doc(db, 'trips', targetTrip.id), {
      members: arrayUnion(newMember),
      invitations: updatedInvitations,
      updatedAt: new Date()
    });
    
    return {
      tripId: targetTrip.id,
      tripName: targetTrip.name,
      message: `Successfully joined "${targetTrip.name}"!`
    };
    
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

// Remove member from trip
export const removeTripMember = async (tripId, memberUserId, removerUserId) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data();
    
    // Check permissions
    if (tripData.createdBy !== removerUserId) {
      const removerMember = tripData.members?.find(m => m.userId === removerUserId);
      if (!removerMember || !['owner', 'admin'].includes(removerMember.role)) {
        throw new Error('Permission denied: Only trip owners/admins can remove members');
      }
    }
    
    // Can't remove trip creator
    if (memberUserId === tripData.createdBy) {
      throw new Error('Cannot remove trip creator');
    }
    
    // Find and remove member
    const memberToRemove = tripData.members?.find(m => m.userId === memberUserId);
    if (!memberToRemove) {
      throw new Error('Member not found in trip');
    }
    
    await updateDoc(tripRef, {
      members: arrayRemove(memberToRemove),
      updatedAt: new Date()
    });
    
    return {
      message: 'Member removed successfully'
    };
    
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

// Update member role
export const updateMemberRole = async (tripId, memberUserId, newRole, updaterUserId) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data();
    
    // Check permissions - only owner can change roles
    if (tripData.createdBy !== updaterUserId) {
      throw new Error('Permission denied: Only trip owner can change member roles');
    }
    
    // Can't change creator's role
    if (memberUserId === tripData.createdBy) {
      throw new Error('Cannot change trip creator role');
    }
    
    // Find and update member role
    const updatedMembers = tripData.members.map(member => 
      member.userId === memberUserId 
        ? { ...member, role: newRole, roleUpdatedAt: new Date() }
        : member
    );
    
    await updateDoc(tripRef, {
      members: updatedMembers,
      updatedAt: new Date()
    });
    
    return {
      message: 'Member role updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

// Get trip members
export const getTripMembers = async (tripId) => {
  try {
    const tripDoc = await getDoc(doc(db, 'trips', tripId));
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data();
    return {
      members: tripData.members || [],
      invitations: tripData.invitations || [],
      shareCode: tripData.shareCode,
      isPublic: tripData.isPublic || false
    };
    
  } catch (error) {
    console.error('Error getting trip members:', error);
    throw error;
  }
};