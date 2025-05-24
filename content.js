// JustPageスタイルのID
const JUSTPAGE_STYLE_ID = 'justpage-style';

// ページが読み込まれたときに実行
(function() {
  // ポップアップウィンドウでのみ実行
  applyJustPageStyle();
  
  // ESCキーでウィンドウを閉じる
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.close();
    }
  });
})();

// JustPageスタイルを適用する関数
function applyJustPageStyle() {
  // すでにスタイルが適用されている場合は何もしない
  if (document.getElementById(JUSTPAGE_STYLE_ID)) {
    return;
  }
  
  // CSSスタイルを作成
  const style = document.createElement('style');
  style.id = JUSTPAGE_STYLE_ID;
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
  
  // スタイルをドキュメントに追加
  document.head.appendChild(style);
  
  // JustPageモードがアクティブであることを示すクラスをbodyに追加
  document.body.classList.add('justpage-active');
}