// Auth State Management
(function() {
  var currentUser = null;
  var currentProfile = null;

  auth.onAuthStateChanged(function(user) {
    currentUser = user;
    if (user) {
      db.collection('users').doc(user.uid).get().then(function(doc) {
        currentProfile = doc.exists ? doc.data() : null;
        updateHeaderUI(user, currentProfile);
        window.DMC_USER = { uid: user.uid, profile: currentProfile };
        // DMC role: set lang=en and data-role for English UI support
        if (currentProfile && currentProfile.role === 'dmc') {
          document.documentElement.lang = 'en';
          document.documentElement.setAttribute('data-role', 'dmc');
        } else {
          document.documentElement.lang = 'ko';
          document.documentElement.removeAttribute('data-role');
        }
        document.dispatchEvent(new CustomEvent('dmcAuthReady', { detail: window.DMC_USER }));
      }).catch(function() {
        updateHeaderUI(user, null);
        window.DMC_USER = { uid: user.uid, profile: null };
        document.dispatchEvent(new CustomEvent('dmcAuthReady', { detail: window.DMC_USER }));
      });
    } else {
      currentProfile = null;
      window.DMC_USER = null;
      updateHeaderUI(null, null);
      document.dispatchEvent(new CustomEvent('dmcAuthReady', { detail: null }));
    }
  });

  function updateHeaderUI(user, profile) {
    var headerCta = document.querySelector('.header-cta');
    if (!headerCta) return;
    var baseUrl = window.BASE_URL || '/dmc-platform';

    if (user && profile) {
      var dashLink = profile.role === 'admin' ? baseUrl + '/admin/' : baseUrl + '/dashboard/';
      var label = profile.role === 'admin' ? '백오피스' : '마이페이지';
      headerCta.innerHTML =
        '<span style="font-size:13px;color:var(--navy);font-weight:600;margin-right:8px;">' + (profile.companyNameKr || profile.contactName) + '</span>' +
        '<a href="' + dashLink + '" class="btn btn-outline btn-sm">' + label + '</a>' +
        '<button class="btn btn-secondary btn-sm" onclick="auth.signOut().then(function(){location.href=\'' + baseUrl + '/\'})"">로그아웃</button>';

      // 로그인 상태에서 문의 모달 자동 채우기
      setTimeout(function(){
        var fn = document.getElementById('f_name');
        var fe = document.getElementById('f_email');
        var fp = document.getElementById('f_phone');
        if(fn) { fn.value = profile.contactName || ''; fn.readOnly = true; fn.style.background='var(--gray-100)'; }
        if(fe) { fe.value = profile.email || ''; fe.readOnly = true; fe.style.background='var(--gray-100)'; }
        if(fp) { fp.value = profile.phone || ''; fp.readOnly = true; fp.style.background='var(--gray-100)'; }
      }, 500);
    } else {
      headerCta.innerHTML =
        '<a href="' + baseUrl + '/auth/login/" class="btn btn-outline btn-sm">로그인</a>' +
        '<a href="' + baseUrl + '/contact/" class="btn btn-primary btn-sm">문의하기</a>';
    }
  }

  window.DMC_AUTH = {
    getUser: function() { return currentUser; },
    getProfile: function() { return currentProfile; },
    requireAuth: function(redirectUrl) {
      var baseUrl = window.BASE_URL || '/dmc-platform';
      if (!currentUser) {
        location.href = baseUrl + '/auth/login/?redirect=' + encodeURIComponent(redirectUrl || location.pathname);
        return false;
      }
      return true;
    },
    requireApproved: function() {
      if (!currentProfile || currentProfile.status !== 'approved') return false;
      return true;
    }
  };
})();
