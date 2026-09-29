// 스크롤 시 섹션이 부드럽게 나타나는 효과
(function () {
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-reveal');
  var targets = document.querySelectorAll(
    'section:not(.hero) .container > *:not(.section-label):not(.section-title):not(.section-sub)'
  );
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
})();

// 모든 페이지 공통: 카카오톡 문의 고정 버튼 (컴퓨터: 오른쪽 아래 동그라미 / 휴대폰: 화면 아래 바)
(function () {
  var URL = 'http://pf.kakao.com/_exhUms/chat';
  var talk = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3Z"/></svg>';
  var f = document.createElement('a');
  f.className = 'float-kakao'; f.href = URL; f.target = '_blank'; f.rel = 'noopener';
  f.setAttribute('aria-label', '카카오톡으로 문의하기'); f.innerHTML = talk;
  var b = document.createElement('div');
  b.className = 'sticky-cta';
  b.innerHTML = '<a href="' + URL + '" target="_blank" rel="noopener">' + talk + '카카오톡으로 수강 문의하기</a>';
  document.body.appendChild(f); document.body.appendChild(b);
})();
