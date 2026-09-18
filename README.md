# ZZZ Damage Calculator｜絕區零傷害乘區實驗室

以繁體中文呈現的《絕區零》互動傷害計算與公式教學網頁。調整數值，即可查看各乘區如何影響最終傷害，並對照完整公式與數值代入過程。

## 功能

- 九種傷害模式：直傷、貫穿、銳化、異常、紊亂、亂流、異放、耀變、真實傷害。
- 完整傷害公式、變數說明、倍率表與即時計算結果。
- 逐步乘區拆解、比較基準、預設範例與觀念練習。
- 每個參數欄位附「填什麼／值從哪來」說明，另有常數與係數表（防禦係數 794、等級區、各屬性異常倍率等）。
- 參考原遊戲的黑灰面板、黃綠選取色與膠囊按鈕。
- 支援桌面與手機；HTML、CSS、JavaScript 集中於單一檔案，可離線使用。

## 本機開啟

下載專案後，以現代瀏覽器直接開啟 [index.html](index.html)。

使用網頁不需要安裝 Node.js、套件或啟動伺服器；Node.js 僅供執行驗證程式。

## 檔案結構

```text
zzz-damage-calc/
├── index.html          # 網頁入口、樣式與計算邏輯
├── verify-damage.cjs   # 數值、離線依賴與瀏覽器互動驗證
└── README.md           # 專案說明
```

## 驗證

已在 Node.js 24 執行驗證，不需安裝 npm 套件。在專案資料夾執行：

```sh
node verify-damage.cjs
```

執行數值與離線依賴檢查。若也要驗證桌面、手機版面和互動：

```sh
node verify-damage.cjs --browser
```

瀏覽器驗證目前使用 Windows 的下列安裝路徑，依序尋找 Chrome 或 Edge：

- `C:/Program Files/Google/Chrome/Application/chrome.exe`
- `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`

程式使用獨立的暫存瀏覽器設定檔；執行結果會列出截圖位置。其他作業系統或自訂安裝位置需先調整 `verify-damage.cjs` 的瀏覽器路徑。

最近一次驗證：103 項數值與離線檢查，加上桌面、手機各 84 項互動／版面檢查，共 271 項通過。

## 發布到 GitHub Pages

本專案為純靜態網頁，不需自行執行建置指令或安裝依賴。

1. 建立 GitHub repository，例如 `zzz-damage-calc`，將專案檔案上傳至根目錄，確保 `index.html` 不在額外的子資料夾裡。
2. 前往 repository 的 **Settings → Pages**。
3. 在 **Build and deployment → Source** 選擇 **Deploy from a branch**。
4. 選擇存放檔案的分支（例如 `main`），資料夾選 **/(root)**，按 **Save**。
5. 等待部署完成，從 Pages 設定頁開啟網站連結。若部署失敗，可至 **Actions** 查看執行紀錄。

後續更新發布分支內的 `index.html`，GitHub Pages 就會重新發布。免費方案可使用公開 repository。

步驟依據：[GitHub Pages 官方發布來源設定文件](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。本 README 提供部署方式，不表示專案已上線。

## 公式來源與適用範圍

這是玩家整理的計算與教學工具，並非官方計算器。主要參考：

- [巴哈姆特：傷害種類與乘區](https://forum.gamer.com.tw/Co.php?bsn=74860&sn=32943)
- [巴哈姆特：異常傷害機制](https://forum.gamer.com.tw/Co.php?bsn=74860&sn=32963)
- [巴哈姆特：異放與快照進階觀念](https://forum.gamer.com.tw/Co.php?bsn=74860&sn=36497)
- [日文 Wiki：傷害計算式](https://wikiwiki.jp/zenless/ダメージ計算式)
- [日文 Wiki：狀態異常](https://wikiwiki.jp/zenless/状態異常)
- [GAMEUI：視覺風格參考](https://www.gameui.net/games/14605)

公式核對日期為 2026-09-18。耀變取自 5F「蕾米埃爾的耀變傷害」，真實傷害取自 1F「四、真實傷害」；防禦公式的 Lv.60 係數 794 在所引文章中只有「須查表得知」的框架，未列出數字，本專案沿用社群通行值並在頁面標註。特殊公式依玩家實測整理；多人混合積蓄未提供自動計算。角色專屬變體（極性紊亂、極性強擊、決算傷害）未做成獨立模式，頁面說明如何用現有模式代入。浮點計算結果於顯示時四捨五入，遊戲版本、角色機制與實際情境可能影響結果。各模式的詳細假設與限制請見網頁中的「來源與範圍」。

## 修改方式

編輯 `index.html` 即可調整網頁。計算邏輯位於 `damage-engine` script，畫面與互動位於 `damage-ui` script；修改公式後請執行驗證，並同步更新畫面上的公式說明。
