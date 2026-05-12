import api from './api';

class EmergencyContactsService {
  async getContacts(userId) {
    try {
      const response = await api.get(`/contacts/${userId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  async addContact(userId, contact) {
    try {
      const response = await api.post('/contacts', {
        userId,
        ...contact
      });
      return response.data;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }

  async updateContact(contactId, contact) {
    try {
      const response = await api.put(`/contacts/${contactId}`, contact);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async deleteContact(contactId) {
    try {
      const response = await api.delete(`/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  async notifyContacts(userId, emergencyData) {
    try {
      const response = await api.post('/contacts/notify', {
        userId,
        emergencyData
      });
      return response.data;
    } catch (error) {
      console.error('Error notifying contacts:', error);
      // Return a safe fallback so caller always gets a trackingLink
      return {
        success: false,
        notified: 0,
        trackingLink: `${window.location.origin}/track/${emergencyData.emergencyId}`
      };
    }
  }

  async sendGroupSOS(groupId, emergencyData) {
    try {
      const response = await api.post('/contacts/group-sos', {
        groupId,
        emergencyData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending group SOS:', error);
      throw error;
    }
  }
}

const emergencyContactsService = new EmergencyContactsService();
export default emergencyContactsService;
