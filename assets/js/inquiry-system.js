// Firestore Inquiry System
var InquirySystem = {
  createInquiry: function(data) {
    var user = window.DMC_USER;
    if (!user || !user.profile) return Promise.reject('로그인이 필요합니다.');
    var now = firebase.firestore.FieldValue.serverTimestamp();
    return db.collection('inquiries').add({
      tourSlug: data.tourSlug || '',
      tourTitle: data.tourTitle || '',
      agencyUid: user.uid,
      agencyName: user.profile.companyNameKr || user.profile.contactName || '',
      agencyEmail: user.profile.email || '',
      dmcId: data.dmcId || '',
      dmcName: data.dmcName || '',
      subject: data.subject || '',
      message: data.message || '',
      status: 'open',
      createdAt: now,
      updatedAt: now
    });
  },

  getMyInquiries: function(uid) {
    return db.collection('inquiries').where('agencyUid', '==', uid).orderBy('createdAt', 'desc').get();
  },

  getDmcInquiries: function(dmcId) {
    return db.collection('inquiries').where('dmcId', '==', dmcId).orderBy('createdAt', 'desc').get();
  },

  getAllInquiries: function() {
    return db.collection('inquiries').orderBy('createdAt', 'desc').get();
  },

  updateInquiryStatus: function(inquiryId, status) {
    return db.collection('inquiries').doc(inquiryId).update({
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  addComment: function(inquiryId, message) {
    var user = window.DMC_USER;
    if (!user || !user.profile) return Promise.reject('로그인이 필요합니다.');
    return db.collection('inquiries').doc(inquiryId).collection('comments').add({
      authorUid: user.uid,
      authorName: user.profile.contactName || user.profile.companyNameKr || '',
      authorRole: user.profile.role || 'agency',
      message: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  getComments: function(inquiryId) {
    return db.collection('inquiries').doc(inquiryId).collection('comments').orderBy('createdAt', 'asc').get();
  }
};
