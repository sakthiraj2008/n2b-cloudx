const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));
const bot = new Telegraf(config.telegramBotToken);
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

bot.on(['document', 'video', 'audio', 'photo'], async (ctx) => {
    const file = ctx.message.document || ctx.message.video || ctx.message.audio || ctx.message.photo[ctx.message.photo.length - 1];
    const fileName = file.file_name || `file_${Date.now()}`;
    
    // 1. Save metadata to Supabase
    const { error } = await supabase.from('files').insert([{
        file_name: fileName,
        file_size: file.file_size,
        telegram_file_id: file.file_id,
        mime_type: file.mime_type || 'image/jpeg'
    }]);

    if (!error) {
        ctx.reply(`✅ File added to N2B Dashboard!\nName: ${fileName}`);
    } else {
        ctx.reply("❌ Error saving to database.");
        console.log(error);
    }
});

bot.launch();
console.log("Bot is running...");
