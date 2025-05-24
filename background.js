// アイコンがクリックされたときの処理
chrome.action.onClicked.addListener((tab) => {
  // 常に新しいJustPageウィンドウを開く
  activateJustPageMode(tab);
});

// JustPageモードをアクティブにする関数
function activateJustPageMode(tab) {
  // 現在のウィンドウ情報を保存
  chrome.windows.getCurrent((currentWindow) => {
    // 現在のタブのURLを取得
    const url = tab.url;
    
    // 新しいウィンドウを作成（ブラウザUIを最小限にした状態）
    chrome.windows.create({
      url: url,
      type: 'panel',  // パネルウィンドウとして作成
      width: currentWindow.width,
      height: currentWindow.height,
      left: currentWindow.left,
      top: currentWindow.top,
      focused: true,
      state: 'normal'
    }, (newWindow) => {
      // 新しいウィンドウのタブにコンテンツスクリプトを挿入
      chrome.scripting.executeScript({
        target: { tabId: newWindow.tabs[0].id },
        files: ['content.js']
      });
    });
  });
}
