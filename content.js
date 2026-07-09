// JustPageウィンドウ内の各ページに挿入されるスクリプト
// （ページ遷移のたびに再挿入されるため、二重実行を防ぐガードを入れている）
(function () {
  if (window.__justpageInjected) {
    return;
  }
  window.__justpageInjected = true;

  applyJustPageStyle();

  // ESCキーでウィンドウを閉じる
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    // IME変換中のESCや、ページ側が処理済み（モーダルを閉じる等）のESCでは閉じない
    if (event.isComposing || event.defaultPrevented) {
      return;
    }
    chrome.runtime.sendMessage({ type: 'justpage-close' });
  });

  // JustPageスタイルを適用する関数
  function applyJustPageStyle() {
    const STYLE_ID = 'justpage-style';

    // すでにスタイルが適用されている場合は何もしない
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ブラウザUIを非表示にするスタイル */
      body {
        margin: 0 !important;
        padding: 0 !important;
        overflow: auto !important;
      }

      /* ページ全体を表示するためのスタイル */
      html, body {
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
      }

      /* スクロールバーを非表示にする */
      ::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }

      /* Firefox用のスクロールバー非表示 */
      html {
        scrollbar-width: none !important;
      }

      /* IE用のスクロールバー非表示 */
      body {
        -ms-overflow-style: none !important;
      }
    `;

    // headがまだ存在しないページでも確実に適用できるようにフォールバックする
    (document.head || document.documentElement).appendChild(style);

    // JustPageモードがアクティブであることを示すクラスをbodyに追加
    if (document.body) {
      document.body.classList.add('justpage-active');
    }
  }
})();
