// サーバーと画面で共有。再開は在庫・注文・発送の検証後に別途判断する。
export const SHOP_PAUSED = true;
// 新しい購入経路の再開と、旧決済経路の再開は別判断。環境変数では解除しない。
export const LEGACY_CHECKOUT_ENABLED = false;
// 在庫数とは別の暫定安全上限。
export const MAX_CHECKOUT_QUANTITY = 20;
export const MAX_CHECKOUT_LINES = 20;
