/* =========================================================
   FSSuite - menu interactions & language switch
   ========================================================= */
(function () {
  'use strict';

  /* ----- ツール定義（順序: FSstriders → FSScreener → FSSplicer → FSShowdown） ----- */
  var TOOLS = {
    fsst: {
      name: 'FSStriders',
      icon: 'images/icon_fsst.png',
      url: 'https://jiz41.github.io/FSstriders/',
      wip: false,
      ja: 'プレイヤープロフィールカード生成ツール。対戦相手に見せられるカードを、枠番・背景・情報を入力するだけで作れる。',
      en: 'A player profile card generator. Enter your gate number, background and details, and it builds a card you can show to your opponents.'
    },
    fssc: {
      name: 'FSScreener',
      icon: 'images/icon_fssc.png',
      url: 'https://jiz41.github.io/FSScreener/',
      wip: false,
      ja: '馬市場検索ツール。予算・脚質・距離等で絞り込み、気になった馬の実在競走馬としての戦績やエピソードが見られる。',
      en: 'A horse market search tool. Filter by budget, running style, distance and more, then read the real-world racing record and episodes behind a horse that caught your eye.'
    },
    fssp: {
      name: 'FSSplicer',
      icon: 'images/icon_fssp.png',
      url: 'https://fssplicer.pages.dev/',
      wip: false,
      ja: '馬データ生成・改変ツール。実在馬の戦績を参考にしながら自分だけの馬を組み立てられる。',
      en: 'A horse data generator and editor. Build a horse of your own while referring to the records of real racehorses.'
    },
    fssh: {
      name: 'FSShowdown',
      icon: 'images/icon_fssh.png',
      url: 'https://fsshowdown.pages.dev/',
      wip: true,
      ja: '馬の能力差を均一化した専用シートで、純粋にプレイヤーの展開読みと操作の技量だけを測る1対1対戦環境を提供する。',
      en: 'A one-on-one match environment built on a dedicated sheet that levels out differences in horse ability, so only a player’s race reading and handling skill decide the outcome.'
    }
  };

  /* ----- DOM ----- */
  var stage       = document.getElementById('stage');
  var blackout    = document.getElementById('blackout');
  var detail      = document.getElementById('detail');
  var detailIcon  = document.getElementById('detail-icon');
  var detailName  = document.getElementById('detail-name');
  var detailBadge = document.getElementById('detail-badge');
  var detailDesc  = document.getElementById('detail-desc');
  var detailLink  = document.getElementById('detail-link');
  var detailBack  = document.getElementById('detail-back');
  var langToggle  = document.getElementById('lang-toggle');
  var iconButtons = Array.prototype.slice.call(document.querySelectorAll('.icon'));

  var lang = 'ja';
  var currentTool = null;
  var busy = false;

  /* ----- 言語切替 ----- */
  function applyLang(next) {
    lang = next;
    document.documentElement.setAttribute('lang', lang);

    var nodes = document.querySelectorAll('[data-ja][data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = (lang === 'en') ? el.getAttribute('data-en') : el.getAttribute('data-ja');
      if (text !== null) { el.innerHTML = text; }
    }

    var opts = langToggle.querySelectorAll('.lang-toggle__opt');
    for (var j = 0; j < opts.length; j++) {
      if (opts[j].getAttribute('data-lang') === lang) {
        opts[j].classList.add('is-active');
      } else {
        opts[j].classList.remove('is-active');
      }
    }

    if (currentTool) { fillDetail(currentTool); }
  }

  langToggle.addEventListener('click', function () {
    applyLang(lang === 'ja' ? 'en' : 'ja');
  });

  /* ----- 詳細パネルの中身 ----- */
  function fillDetail(key) {
    var t = TOOLS[key];
    if (!t) { return; }

    detailIcon.setAttribute('src', t.icon);
    detailIcon.setAttribute('alt', t.name);
    detailName.innerHTML = '<span class="fss-accent">' + t.name.slice(0, 3) + '</span>' + t.name.slice(3);
    detailDesc.textContent = (lang === 'en') ? t.en : t.ja;
    detailLink.setAttribute('href', t.url);

    if (t.wip) {
      detailBadge.hidden = false;
    } else {
      detailBadge.hidden = true;
    }
  }

  /* ----- アイコン → ズーム → 暗転 → 詳細 ----- */
  function openTool(button) {
    if (busy) { return; }
    var key = button.getAttribute('data-tool');
    if (!TOOLS[key]) { return; }

    busy = true;
    currentTool = key;

    // クリックされたアイコンの中心を stage 座標系の % で求め、拡大の原点にする
    var sRect = stage.getBoundingClientRect();
    var bRect = button.getBoundingClientRect();
    var ox = ((bRect.left + bRect.width  / 2) - sRect.left) / sRect.width  * 100;
    var oy = ((bRect.top  + bRect.height / 2) - sRect.top)  / sRect.height * 100;

    stage.style.setProperty('--ox', ox.toFixed(2) + '%');
    stage.style.setProperty('--oy', oy.toFixed(2) + '%');
    stage.classList.add('is-zooming');

    // ズームの途中から暗転を重ねる
    window.setTimeout(function () {
      blackout.classList.add('is-on');
    }, 260);

    // 暗転しきってから詳細をフェードイン
    window.setTimeout(function () {
      fillDetail(key);
      detail.classList.add('is-open');
      detail.setAttribute('aria-hidden', 'false');
      blackout.classList.remove('is-on');
      detailBack.focus();
      busy = false;
    }, 720);
  }

  /* ----- 戻る（暗転 → ズームアウト） ----- */
  function closeTool() {
    if (busy) { return; }
    busy = true;

    blackout.classList.add('is-on');

    window.setTimeout(function () {
      detail.classList.remove('is-open');
      detail.setAttribute('aria-hidden', 'true');
      stage.classList.remove('is-zooming');
    }, 380);

    window.setTimeout(function () {
      blackout.classList.remove('is-on');
      var prev = document.querySelector('.icon[data-tool="' + currentTool + '"]');
      if (prev) { prev.focus(); }
      currentTool = null;
      busy = false;
    }, 900);
  }

  iconButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { openTool(btn); });
  });

  detailBack.addEventListener('click', closeTool);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && detail.classList.contains('is-open')) {
      closeTool();
    }
  });

  /* ----- 初期化 ----- */
  applyLang('ja');
})();
