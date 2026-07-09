// JustPageウィンドウのID一覧を保持するstorageキー
// （Service Workerは随時終了・再起動されるため、メモリではなくstorage.sessionに保存する）
const STORAGE_KEY = 'justpageWindowIds';

// コンテンツスクリプトを挿入できないURL（chrome:// や拡張機能ページなど）かどうか
function isRestrictedUrl(url) {
  return !url || !/^(https?|file):/.test(url);
}

async function getJustPageWindowIds() {
  const data = await chrome.storage.session.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}

async function addJustPageWindowId(windowId) {
  const ids = await getJustPageWindowIds();
  if (!ids.includes(windowId)) {
    ids.push(windowId);
    await chrome.storage.session.set({ [STORAGE_KEY]: ids });
  }
}

async function removeJustPageWindowId(windowId) {
  const ids = await getJustPageWindowIds();
  if (ids.includes(windowId)) {
    await chrome.storage.session.set({
      [STORAGE_KEY]: ids.filter((id) => id !== windowId),
    });
  }
}

// アイコンがクリックされたときの処理
chrome.action.onClicked.addListener((tab) => {
  activateJustPageMode(tab);
});

// JustPageモードをアクティブにする関数
async function activateJustPageMode(tab) {
  // chrome:// などスクリプトを挿入できないページでは何もしない
  if (isRestrictedUrl(tab.url)) {
    return;
  }

  try {
    const currentWindow = await chrome.windows.getCurrent();

    // 新しいポップアップウィンドウを作成（ブラウザUIを最小限にした状態）
    const newWindow = await chrome.windows.create({
      url: tab.url,
      type: 'popup',
      width: currentWindow.width,
      height: currentWindow.height,
      left: currentWindow.left,
      top: currentWindow.top,
      focused: true,
    });

    // コンテンツスクリプトの挿入はページ読み込み完了後に
    // tabs.onUpdated 側で行うため、ここではウィンドウIDだけ記録する
    await addJustPageWindowId(newWindow.id);
  } catch (error) {
    console.error('JustPage: ウィンドウの作成に失敗しました', error);
  }
}

// JustPageウィンドウ内のタブが読み込み完了したらコンテンツスクリプトを挿入する
// （ウィンドウ内でページ遷移してもスタイルとESCキー操作を維持するため）
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') {
    return;
  }

  const ids = await getJustPageWindowIds();
  if (!ids.includes(tab.windowId) || isRestrictedUrl(tab.url)) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
  } catch (error) {
    console.error('JustPage: スクリプトの挿入に失敗しました', error);
  }
});

// ウィンドウが閉じられたら記録から削除する
chrome.windows.onRemoved.addListener((windowId) => {
  removeJustPageWindowId(windowId);
});

// コンテンツスクリプトからの「ウィンドウを閉じる」要求
// （window.close() はページ遷移後に効かなくなるため、windows.remove で確実に閉じる）
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'justpage-close' || !sender.tab) {
    return;
  }

  const { windowId } = sender.tab;
  getJustPageWindowIds().then((ids) => {
    // JustPageウィンドウ以外は閉じない
    if (ids.includes(windowId)) {
      chrome.windows.remove(windowId);
    }
  });
});
