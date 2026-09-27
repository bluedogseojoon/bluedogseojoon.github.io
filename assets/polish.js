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
