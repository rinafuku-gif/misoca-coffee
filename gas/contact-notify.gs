/**
 * 三十日珈琲 お問い合わせ通知スクリプト
 *
 * 【セットアップ手順】
 * 1. Google Apps Script (https://script.google.com) で新しいプロジェクトを作成
 * 2. このファイルの内容をコピーして貼り付け
 * 3. 「デプロイ」→「新しいデプロイ」→ 種類を「ウェブアプリ」に選択
 * 4. アクセスできるユーザーを「全員」に設定 → デプロイ
 * 5. 表示されたURLをコピー → VercelのGAS_WEBHOOK_URLに設定
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var subject = '【三十日珈琲】' + data.type + '：' + data.name + '様よりお問い合わせ';

    var body = [
      '━━━━━━━━━━━━━━━━━━━━',
      '  三十日珈琲 お問い合わせ通知',
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      '■ お問い合わせ種別',
      '  ' + data.type,
      '',
      '■ お名前',
      '  ' + data.name,
      '',
      '■ メールアドレス',
      '  ' + data.email,
      '',
      '■ 電話番号',
      '  ' + (data.phone || '未入力'),
      '',
      '■ お問い合わせ内容',
      '  ' + data.message,
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '※ このメールはWebサイトのお問い合わせフォームから自動送信されています。',
      '※ お客様への返信は ' + data.email + ' 宛にお願いします。',
    ].join('\n');

    GmailApp.sendEmail('misocacoffee@gmail.com', subject, body, {
      replyTo: data.email,
      name: '三十日珈琲 お問い合わせフォーム'
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
