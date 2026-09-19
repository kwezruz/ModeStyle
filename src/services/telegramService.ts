import { Order, TelegramBotConfig, TelegramCustomerProfile } from '../types';

const CUSTOMERS_STORAGE_KEY = 'modestyle_telegram_customers';

export function getStoredTelegramCustomers(): TelegramCustomerProfile[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read telegram customers:', e);
  }
  return [];
}

export function saveStoredTelegramCustomer(profile: TelegramCustomerProfile): void {
  try {
    const list = getStoredTelegramCustomers();
    const existingIndex = list.findIndex((c) => c.chatId === profile.chatId);
    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      list[existingIndex] = {
        ...existing,
        ...profile,
        firstName: profile.firstName || existing.firstName,
        lastName: profile.lastName || existing.lastName,
        username: profile.username || existing.username,
        phone: profile.phone || existing.phone,
        location: profile.location || existing.location,
        addressText: profile.addressText || existing.addressText,
        lastActive: new Date().toISOString(),
      };
    } else {
      list.unshift({
        ...profile,
        registeredAt: profile.registeredAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
    }
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('modestyle_telegram_customers_updated', { detail: list }));
    }
  } catch (e) {
    console.error('Failed to save telegram customer:', e);
  }
}

export function clearStoredTelegramCustomers(): void {
  try {
    localStorage.removeItem(CUSTOMERS_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('modestyle_telegram_customers_updated', { detail: [] }));
    }
  } catch (e) {
    console.error(e);
  }
}

export function addCustomerMessage(
  chatId: string,
  sender: 'customer' | 'operator',
  text: string
): void {
  try {
    const list = getStoredTelegramCustomers();
    const idx = list.findIndex((c) => c.chatId === chatId);
    const newMsg = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
    };
    if (idx >= 0) {
      if (!list[idx].messages) list[idx].messages = [];
      list[idx].messages!.push(newMsg);
      list[idx].lastActive = new Date().toISOString();
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('modestyle_telegram_customers_updated', { detail: list })
        );
      }
    }
  } catch (e) {
    console.error('Failed to add customer message:', e);
  }
}

let activeChatUserId: string | null = null;

export function getPhoneKeyboard() {
  return {
    keyboard: [
      [{ text: '📱 Telefon raqamni yuborish', request_contact: true }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function getLocationKeyboard() {
  return {
    keyboard: [
      [{ text: '📍 Lokatsiyani yuborish', request_location: true }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function getRemoveKeyboard() {
  return {
    remove_keyboard: true,
  };
}

export function getCustomerReplyKeyboard() {
  return getPhoneKeyboard();
}

export const DEFAULT_TELEGRAM_CONFIG: TelegramBotConfig = {
  botToken: '8203001916:AAH2yAU_Le2oxSszoS3jqRCP2vhXJw2WaLs',
  chatId: '2002780745', // Admin (@kwezr)
  botUsername: 'Modestyleuzbot',
  enabled: true,
  notifyOrders: true,
  notifyChat: true,
  telegramChannel: 'https://t.me/modestyle_uz',
  instagramProfile: 'https://instagram.com/modestyle.uz',
  adminUsername: '@kwezr',
  storeWebsiteUrl: 'https://modestyle.uz',
  adminPin: '1234',
  welcomePromoText: "ModeStyle.uz — Zamonaviy streetwear kiyimlar va original krossovkalar do'koni! 🛍👕👟",
};

/**
 * Send text message to Telegram Chat with optional InlineKeyboard reply_markup
 */
export async function sendTelegramMessage(
  config: TelegramBotConfig,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML',
  replyMarkup?: any
): Promise<{ ok: boolean; error?: string }> {
  if (!config.enabled || !config.botToken.trim() || !config.chatId.trim()) {
    return { ok: false, error: 'Telegram sozlamalari to\'liq kiritilmagan (Chat ID bo\'sh)' };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
    const payload: any = {
      chat_id: config.chatId.trim(),
      text,
      parse_mode: parseMode,
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.description || 'Telegram xabarni qabul qilmadi' };
    }
    return { ok: true };
  } catch (err: any) {
    console.error('Telegram notification error:', err);
    return { ok: false, error: err.message || 'Tarmoq xatosi' };
  }
}

/**
 * Send photo (e.g. payment receipt) with caption
 */
/**
 * Helper to convert data URL (base64) into a Blob for multipart FormData upload
 */
function dataURLtoBlob(dataurl: string): Blob {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Failed to convert dataURL to Blob:', e);
    return new Blob([], { type: 'image/jpeg' });
  }
}

/**
 * Send photo (URL or base64 data:image) with caption to Telegram
 */
export async function sendTelegramPhoto(
  config: TelegramBotConfig,
  photoSource: string,
  caption?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!config.enabled || !config.botToken.trim() || !config.chatId.trim()) {
    return { ok: false, error: "Telegram sozlamalari to'liq kiritilmagan" };
  }

  const trimmedCaption = caption
    ? caption.length > 1020
      ? caption.slice(0, 1017) + '...'
      : caption
    : '';

  try {
    const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendPhoto`;

    if (photoSource.startsWith('data:image')) {
      // Base64 image: send as multipart/form-data Blob
      const blob = dataURLtoBlob(photoSource);
      const formData = new FormData();
      formData.append('chat_id', config.chatId.trim());
      formData.append('photo', blob, 'tolov_cheki.jpg');
      if (trimmedCaption) {
        formData.append('caption', trimmedCaption);
        formData.append('parse_mode', 'HTML');
      }

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.ok) {
        console.warn('Telegram sendPhoto FormData error:', data);
        return { ok: false, error: data.description };
      }
      return { ok: true };
    } else {
      // Remote URL image
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId.trim(),
          photo: photoSource,
          caption: trimmedCaption || undefined,
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        return { ok: false, error: data.description };
      }
      return { ok: true };
    }
  } catch (err: any) {
    console.error('Telegram sendPhoto error:', err);
    return { ok: false, error: err.message || 'Tarmoq xatosi' };
  }
}

/**
 * Format and notify a new customer order to Telegram with receipt photo
 */
export async function notifyNewOrderToTelegram(
  config: TelegramBotConfig,
  order: Order
): Promise<void> {
  if (!config.enabled || !config.notifyOrders || !config.chatId.trim()) return;

  const itemsList = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. <b>${it.product.title}</b>\n` +
        `   • Razmer: <code>${it.selectedSize}</code>${
          it.selectedColor ? ` | Rang: ${it.selectedColor}` : ''
        }\n` +
        `   • ${it.quantity} dona x ${it.product.price.toLocaleString('uz-UZ')} so'm`
    )
    .join('\n\n');

  const orderSummaryText =
    `🛍 <b>YANGI BUYURTMA QABUL QILINDI!</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `🆔 <b>Buyurtma ID:</b> <code>#${order.orderNumber || order.id}</code>\n` +
    `👤 <b>Mijoz:</b> ${order.customerName}\n` +
    `📞 <b>Telefon:</b> <a href="tel:${order.phone}">${order.phone}</a>\n` +
    `📍 <b>Manzil:</b> ${order.city}, ${order.address}\n` +
    `💳 <b>To'lov usuli:</b> ${order.paymentMethod === 'card' ? 'Karta orqali' : 'Yetkazilganda naqd'}\n` +
    `📊 <b>Holati:</b> ${order.receiptImage ? 'To\'lov cheki taqdim etildi' : 'Cheksiz / Naqd'}\n` +
    (order.promoCode ? `🏷 <b>Promokod:</b> <code>${order.promoCode}</code>\n` : '') +
    `\n📦 <b>Buyurtma tarkibi:</b>\n${itemsList}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>JAMI TO'LOV:</b> <b>${(order.totalAmount || 0).toLocaleString('uz-UZ')} so'm</b>\n` +
    `🕒 <b>Vaqt:</b> ${new Date(order.createdAt).toLocaleString('uz-UZ')}\n` +
    (order.notes ? `📝 <b>Mijoz izohi:</b> <i>${order.notes}</i>\n` : '');

  // If receipt image is present (base64 or URL), send the photo directly!
  if (order.receiptImage) {
    const photoCaption =
      `🧾 <b>TO'LOV CHEKI — #${order.orderNumber || order.id}</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Mijoz:</b> ${order.customerName}\n` +
      `📞 <a href="tel:${order.phone}">${order.phone}</a>\n` +
      `💰 <b>Summa:</b> <b>${(order.totalAmount || 0).toLocaleString('uz-UZ')} so'm</b>\n` +
      `💳 <b>To'lov:</b> Karta orqali to'langan`;

    const photoRes = await sendTelegramPhoto(config, order.receiptImage, photoCaption);

    if (!photoRes.ok) {
      console.warn('Receipt photo failed to send, sending as notice:', photoRes.error);
    }
  }

  // Always send the full detailed order breakdown text
  await sendTelegramMessage(config, orderSummaryText);
}

/**
 * Format and notify incoming customer chat question to Telegram
 */
export async function notifyCustomerChatToTelegram(
  config: TelegramBotConfig,
  customerText: string,
  customerName: string = 'Mijoz'
): Promise<void> {
  if (!config.enabled || !config.notifyChat || !config.chatId.trim()) return;

  const text = `💬 <b>JONLI CHAT: YANGI SAVOL!</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Kimdan:</b> ${customerName}\n` +
    `📩 <b>Mijoz xabari:</b>\n"${customerText}"\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡️ <i>Mijoz saytda operator javobini kutmoqda!</i>`;

  await sendTelegramMessage(config, text);
}

/**
 * Fetch updates from the bot to easily detect admin's Chat ID automatically
 */
export async function getTelegramRecentChats(
  botToken: string
): Promise<Array<{ id: string; name: string; username?: string; type: string }>> {
  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/getUpdates?limit=20`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result)) return [];

    const chatsMap = new Map<string, { id: string; name: string; username?: string; type: string }>();

    for (const update of data.result) {
      const msg = update.message || update.channel_post || update.edited_message;
      if (msg && msg.chat) {
        const c = msg.chat;
        const idStr = String(c.id);
        const name = c.first_name || c.title || c.username || 'Foydalanuvchi';
        chatsMap.set(idStr, {
          id: idStr,
          name: `${name} ${c.last_name || ''}`.trim(),
          username: c.username,
          type: c.type,
        });
      }
    }

    return Array.from(chatsMap.values());
  } catch (e) {
    console.error('Failed to get updates:', e);
    return [];
  }
}

let lastHandledUpdateId = 0;
const authorizedAdminChats = new Set<string>();

/**
 * Format raw handle or URL into valid clickable URL for Telegram inline keyboard
 */
function normalizeUrl(input: string | undefined, defaultUrl: string, type: 'telegram' | 'instagram'): string {
  if (!input || !input.trim()) return defaultUrl;
  const val = input.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  const clean = val.replace(/^@/, '');
  if (type === 'telegram') return `https://t.me/${clean}`;
  if (type === 'instagram') return `https://instagram.com/${clean}`;
  return defaultUrl;
}

/**
 * Poll Telegram updates and automatically reply:
 * - ADMIN: commands (/status, /orders, /site, /promo, /broadcast)
 * - REGULAR USERS (CUSTOMERS): Official store advertisement, channels (Telegram & Instagram), website button, live operator assistance
 * - PRIVACY: Orders and statistics are strictly hidden from non-admin users!
 */
export async function processTelegramBotUpdates(
  config: TelegramBotConfig,
  orders: Order[] = [],
  productsCount: number = 0
): Promise<void> {
  if (!config.enabled || !config.botToken.trim()) return;

  try {
    const offsetParam = lastHandledUpdateId > 0 ? `?offset=${lastHandledUpdateId + 1}` : '';
    const res = await fetch(
      `https://api.telegram.org/bot${config.botToken.trim()}/getUpdates${offsetParam}`
    );
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result) || data.result.length === 0) return;

    // Resolve channel & social links
    const channelUrl = normalizeUrl(config.telegramChannel, 'https://t.me/modestyle_uz', 'telegram');
    const instagramUrl = normalizeUrl(config.instagramProfile, 'https://instagram.com/modestyle.uz', 'instagram');
    const siteUrl = config.storeWebsiteUrl?.trim() || 'https://modestyle.uz';

    const customerKeyboard = {
      inline_keyboard: [
        [{ text: '🛍 Saytga kirish va Xarid qilish', url: siteUrl }],
        [
          { text: '📢 Telegram Kanalimiz', url: channelUrl },
          { text: '📸 Instagram Sahifamiz', url: instagramUrl },
        ],
      ],
    };

    const customerPromoText =
      `✨ <b>MODESTYLE.UZ — RASMIY ONLAYN DO'KONI!</b> 🛍👕👟\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `Assalomu alaykum! Zamonaviy streetwear kiyimlar va eng so'nggi urfdagi brend krossovkalar do'konimizga xush kelibsiz!\n\n` +
      `🔥 <b>Bizning afzalliklarimiz:</b>\n` +
      `• 100% Sifatli materiallar va original dizayn\n` +
      `• Toshkent shahrida 2-3 soatda tezkor yetkazib berish 🚀\n` +
      `• O'zbekistonning barcha viloyatlariga pochta orqali yetkazish 📦\n` +
      `• To'lovni tovar yetib kelganda ko'rib, naqd yoki karta orqali to'lash!\n` +
      `• Jacob operatorimiz bo'y va vazningizga mos aniq razmerni (masalan: 170 sm va 77 kg uchun 2XL) tanlab beradi 📏\n\n` +
      `📱 <b>Bizning rasmiy sahifalarimiz:</b>\n` +
      `📢 <b>Telegram Kanal:</b> <a href="${channelUrl}">${config.telegramChannel || '@modestyle_uz'}</a>\n` +
      `📸 <b>Instagram:</b> <a href="${instagramUrl}">${config.instagramProfile || '@modestyle.uz'}</a>\n` +
      `🌐 <b>Sayt:</b> <a href="${siteUrl}">${siteUrl.replace(/^https?:\/\//, '')}</a>\n\n` +
      `<i>Kanalimiz va sahifalarimizga obuna bo'ling, tez orada yangi kolleksiya va maxsus aksiyalar e'lon qilinadi!</i> 🎁\n\n` +
      `👇 <b>Do'konga kirish yoki obuna bo'lish uchun pastdagi tugmalarni bosing:</b>`;

    const customerReplyKeyboard = getCustomerReplyKeyboard();

    for (const update of data.result) {
      if (update.update_id > lastHandledUpdateId) {
        lastHandledUpdateId = update.update_id;
      }

      // Handle callback queries (e.g. update info button)
      if (update.callback_query) {
        const cb = update.callback_query;
        const cbChatId = String(cb.message?.chat?.id || cb.from?.id);
        try {
          fetch(`https://api.telegram.org/bot${config.botToken.trim()}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: cb.id }),
          }).catch(() => {});
        } catch {}

        if (cb.data === 'update_info' || cb.data === 'restart_info') {
          await sendTelegramMessage(
            { ...config, chatId: cbChatId },
            `📱 <b>Ma'lumotlarni yangilash:</b>\n\nIltimos, telefon raqamingizni yuboring:`,
            'HTML',
            getPhoneKeyboard()
          );
          continue;
        }
      }

      const msg = update.message;
      if (!msg || !msg.chat) continue;

      const chatId = String(msg.chat.id);
      const primaryAdminChatId = config.chatId.trim();
      const isAdmin = primaryAdminChatId === chatId || authorizedAdminChats.has(chatId);

      const senderFirstName = msg.from?.first_name || '';
      const senderLastName = msg.from?.last_name || '';
      const senderName = `${senderFirstName} ${senderLastName}`.trim() || 'Mijoz';
      const senderUsername = msg.from?.username ? `@${msg.from.username}` : undefined;

      // Always track/update customer profile
      saveStoredTelegramCustomer({
        chatId,
        firstName: senderFirstName,
        lastName: senderLastName,
        username: senderUsername,
        registeredAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });

      // ==========================================
      // A. USER SENDS REAL GPS LOCATION (request_location)
      // ==========================================
      if (msg.location) {
        const lat = msg.location.latitude;
        const lng = msg.location.longitude;
        const googleMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const yandexMapUrl = `https://yandex.uz/maps/?pt=${lng},${lat}&z=16&l=map`;

        saveStoredTelegramCustomer({
          chatId,
          firstName: senderFirstName,
          lastName: senderLastName,
          username: senderUsername,
          location: {
            latitude: lat,
            longitude: lng,
            googleMapUrl,
            yandexMapUrl,
          },
          registeredAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        });

        // 1. Notify Admin immediately
        if (primaryAdminChatId) {
          await sendTelegramMessage(
            { ...config, chatId: primaryAdminChatId },
            `📍 <b>YANGI MIJOZ LOKATSIYASINI YUBORDI!</b> 🗺\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 <b>Mijoz:</b> ${senderName} (${senderUsername || "username yo'q"})\n` +
            `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
            `🗺 <b>Koordinatalar:</b> <code>${lat.toFixed(6)}, ${lng.toFixed(6)}</code>\n` +
            `🕒 <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `📍 <b>Google Xarita:</b> <a href="${googleMapUrl}">Xaritada ochish 🗺</a>\n` +
            `🚕 <b>Yandex Xarita:</b> <a href="${yandexMapUrl}">Taksida / Kuryerda ochish 🚕</a>`,
            'HTML',
            {
              inline_keyboard: [
                [
                  { text: '🗺 Google Xaritada ochish', url: googleMapUrl },
                  { text: '🚕 Yandex Xaritada ochish', url: yandexMapUrl },
                ],
              ],
            }
          );
        }

        // Check if customer already has phone
        const currentProfile = getStoredTelegramCustomers().find((c) => c.chatId === chatId);
        if (!currentProfile?.phone) {
          // Still need phone number
          await sendTelegramMessage(
            { ...config, chatId },
            `📍 <b>Lokatsiyangiz qabul qilindi!</b>\n\n` +
            `Endi operatorimiz va kuryer siz bilan bog'lanishi uchun <b>telefon raqamingizni yuboring 📱</b>:`,
            'HTML',
            getPhoneKeyboard()
          );
        } else {
          // BOTH LOCATION & PHONE ARE COMPLETE -> Remove keyboard, show info & online operator!
          await sendTelegramMessage(
            { ...config, chatId },
            `📍 <b>Lokatsiyangiz muvaffaqiyatli saqlandi!</b>`,
            'HTML',
            getRemoveKeyboard()
          );

          await sendTelegramMessage(
            { ...config, chatId },
            `🎉 <b>MA'LUMOTLARINGIZ QABUL QILINDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 <b>Ism:</b> ${senderName}\n` +
            `📞 <b>Telefon:</b> <code>${currentProfile.phone}</code>\n` +
            `📍 <b>Manzil:</b> Aniq lokatsiya saqlandi (<a href="${googleMapUrl}">Xaritada ko'rish 🗺</a>)\n\n` +
            `🟢 <b>Operator hozir online!</b>\n\n` +
            `Savollaringiz yoki xabaringizni shu yerga bemalol yozishingiz mumkin. Operatorimiz to'g'ridan-to'g'ri bot orqali javob beradi 💬`,
            'HTML',
            {
              inline_keyboard: [
                [
                  { text: '🛍 Saytga kirish', url: siteUrl },
                  { text: "🔄 Ma'lumotlarni yangilash", callback_data: 'update_info' },
                ],
              ],
            }
          );
        }
        continue;
      }

      // ==========================================
      // B. USER SENDS CONTACT (request_contact)
      // ==========================================
      let receivedPhone = '';
      if (msg.contact) {
        receivedPhone = msg.contact.phone_number || '';
      } else if (msg.text) {
        // Also check if user typed phone number as plain text
        const cleanDigits = msg.text.trim().replace(/[\s\-\(\)]/g, '');
        if (/^\+?998\d{9}$/.test(cleanDigits)) {
          receivedPhone = cleanDigits.startsWith('+') ? cleanDigits : `+${cleanDigits}`;
        } else if (/^\d{9}$/.test(cleanDigits)) {
          receivedPhone = `+998${cleanDigits}`;
        }
      }

      if (receivedPhone) {
        if (!receivedPhone.startsWith('+') && receivedPhone.length === 12) {
          receivedPhone = `+${receivedPhone}`;
        }

        saveStoredTelegramCustomer({
          chatId,
          firstName: msg.contact?.first_name || senderFirstName,
          lastName: msg.contact?.last_name || senderLastName,
          username: senderUsername,
          phone: receivedPhone,
          registeredAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        });

        // 1. Alert Admin
        if (primaryAdminChatId) {
          await sendTelegramMessage(
            { ...config, chatId: primaryAdminChatId },
            `📱 <b>MIJOZ TELEFON RAQAMINI YUBORDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 <b>Mijoz:</b> ${senderName} (${senderUsername || ''})\n` +
            `📞 <b>Telefon:</b> <code>${receivedPhone}</code>\n` +
            `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
            `🕒 <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}`
          );
        }

        // Check if customer already has location
        const currentProfile = getStoredTelegramCustomers().find((c) => c.chatId === chatId);
        if (!currentProfile?.location) {
          // Next step: ask for location with 1 single button
          await sendTelegramMessage(
            { ...config, chatId },
            `✅ <b>Telefon raqamingiz qabul qilindi:</b> <code>${receivedPhone}</code> 📱\n\n` +
            `Endi tovarlarni Toshkent bo'ylab <b>2-3 soatda</b> tezkor yetkazib berishimiz uchun <b>lokatsiyangizni yuboring 📍</b>:`,
            'HTML',
            getLocationKeyboard()
          );
        } else {
          // BOTH COMPLETE -> Remove keyboard, show clean info & online operator!
          await sendTelegramMessage(
            { ...config, chatId },
            `✅ <b>Telefon raqamingiz saqlandi:</b> <code>${receivedPhone}</code>`,
            'HTML',
            getRemoveKeyboard()
          );

          await sendTelegramMessage(
            { ...config, chatId },
            `🎉 <b>MA'LUMOTLARINGIZ QABUL QILINDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 <b>Ism:</b> ${senderName}\n` +
            `📞 <b>Telefon:</b> <code>${receivedPhone}</code>\n` +
            `📍 <b>Manzil:</b> Aniq lokatsiya saqlandi\n\n` +
            `🟢 <b>Operator hozir online!</b>\n\n` +
            `Savollaringiz yoki xabaringizni shu yerga bemalol yozishingiz mumkin. Operatorimiz to'g'ridan-to'g'ri bot orqali javob beradi 💬`,
            'HTML',
            {
              inline_keyboard: [
                [
                  { text: '🛍 Saytga kirish', url: siteUrl },
                  { text: "🔄 Ma'lumotlarni yangilash", callback_data: 'update_info' },
                ],
              ],
            }
          );
        }
        continue;
      }

      // ==========================================
      // C. TEXT MESSAGES & COMMANDS
      // ==========================================
      const text = (msg.text || '').trim();
      if (!text) continue;
      const lowerText = text.toLowerCase();

      // 1. Check for Admin PIN authorization (/login 1234 or /admin 1234)
      const pinToMatch = config.adminPin?.trim() || '1234';
      if (lowerText.startsWith('/login') || lowerText.startsWith('/admin')) {
        const parts = text.split(/\s+/);
        const enteredPin = parts[1];
        if (enteredPin === pinToMatch) {
          authorizedAdminChats.add(chatId);
          await sendTelegramMessage(
            { ...config, chatId },
            `👑 <b>TABRIKLAYMIZ, ADMIN SIFATIDA TASDIQLANDINGIZ!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `Sizga do'kon boshqaruv buyruqlari ochildi:\n` +
            `📊 <b>/status</b> — Savdo statistikasi\n` +
            `📦 <b>/orders</b> — So'nggi buyurtmalar\n` +
            `📢 <b>/promo</b> — Reklama matnini ko'rish\n` +
            `🌐 <b>/site</b> — Do'kon havolasi`
          );
          continue;
        } else if (!isAdmin) {
          await sendTelegramMessage(
            { ...config, chatId },
            `❌ Noto'g'ri PIN kod kiritildi. Agar siz do'kon egasi bo'lsangiz, to'g'ri parolni kiriting (Masalan: <code>/login 1234</code>).`
          );
          continue;
        }
      }

      // 2. ACTIONS FOR ADMIN
      if (isAdmin) {
        // A. ADMIN REPLIES TO CUSTOMER VIA NATIVE TELEGRAM "REPLY"
        if (msg.reply_to_message && msg.reply_to_message.text) {
          const repliedText = msg.reply_to_message.text;
          const match =
            repliedText.match(/(?:Chat ID|🆔|ID):\s*([0-9]{5,})/i) ||
            repliedText.match(/<code>([0-9]{5,})<\/code>/);
          if (match && match[1]) {
            const targetChatId = match[1];
            await sendTelegramMessage(
              { ...config, chatId: targetChatId },
              `👨‍💼 <b>Operator:</b>\n\n${text}`,
              'HTML'
            );
            addCustomerMessage(targetChatId, 'operator', text);
            await sendTelegramMessage(
              { ...config, chatId },
              `✅ <i>Mijozga (${targetChatId}) javob yetkazildi:</i>\n\n"${text}"`,
              'HTML'
            );
            continue;
          }
        }

        // B. ADMIN REPLIES VIA COMMAND: /reply <chatId> <matn> or /r or /javob
        const replyCmd = text.match(/^\/(?:reply|r|javob)\s+([0-9]{5,})\s+([\s\S]+)/i);
        if (replyCmd) {
          const targetChatId = replyCmd[1];
          const replyText = replyCmd[2].trim();
          await sendTelegramMessage(
            { ...config, chatId: targetChatId },
            `👨‍💼 <b>Operator:</b>\n\n${replyText}`,
            'HTML'
          );
          addCustomerMessage(targetChatId, 'operator', replyText);
          await sendTelegramMessage(
            { ...config, chatId },
            `✅ <i>Mijozga (${targetChatId}) javob yetkazildi:</i>\n\n"${replyText}"`,
            'HTML'
          );
          continue;
        }

        // C. ADMIN SETS ACTIVE CUSTOMER CHAT: /chat <chatId> or /stopchat
        if (lowerText.startsWith('/chat')) {
          const parts = text.split(/\s+/);
          if (parts[1] && /^[0-9]{5,}$/.test(parts[1])) {
            activeChatUserId = parts[1];
            const targetCust = getStoredTelegramCustomers().find((c) => c.chatId === activeChatUserId);
            const targetName = targetCust ? `${targetCust.firstName || ''} ${targetCust.lastName || ''}`.trim() : activeChatUserId;
            await sendTelegramMessage(
              { ...config, chatId },
              `🎯 <b>Aktiv mijoz belgilandi:</b> ${targetName} (<code>${activeChatUserId}</code>)\n\nEndi yozgan har bir oddiy xabaringiz to'g'ridan-to'g'ri shu mijozga bot orqali boradi.\n\nChiqish uchun: <code>/stopchat</code>`,
              'HTML'
            );
            continue;
          }
        }

        if (lowerText === '/stopchat') {
          activeChatUserId = null;
          await sendTelegramMessage(
            { ...config, chatId },
            `✅ Chat rejimi to'xtatildi.`,
            'HTML'
          );
          continue;
        }

        // D. If admin is in active chat mode and sends plain text
        if (activeChatUserId && !text.startsWith('/')) {
          await sendTelegramMessage(
            { ...config, chatId: activeChatUserId },
            `👨‍💼 <b>Operator:</b>\n\n${text}`,
            'HTML'
          );
          addCustomerMessage(activeChatUserId, 'operator', text);
          await sendTelegramMessage(
            { ...config, chatId },
            `✅ <i>Xabar mijozga (${activeChatUserId}) yetkazildi:</i>\n\n"${text}"`,
            'HTML'
          );
          continue;
        }

        // E. Admin info commands
        if (lowerText.startsWith('/status')) {
          const total = orders.length;
          const pending = orders.filter((o) => o.orderStatus === 'new' || o.orderStatus === 'processing').length;
          const confirmed = orders.filter((o) => o.orderStatus === 'delivered' || o.paymentStatus === 'paid').length;
          const totalSum = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          const customers = getStoredTelegramCustomers();
          const withLocations = customers.filter((c) => !!c.location).length;

          await sendTelegramMessage(
            { ...config, chatId },
            `📊 <b>MODESTYLE.UZ — DO'KON STATISTIKASI (ADMIN)</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `📦 <b>Jami buyurtmalar:</b> ${total} ta\n` +
            `⏳ <b>Kutilayotgan:</b> ${pending} ta\n` +
            `✅ <b>Yetkazilgan/Tasdiqlangan:</b> ${confirmed} ta\n` +
            `💰 <b>Jami savdo hajmi:</b> ${totalSum.toLocaleString('uz-UZ')} so'm\n` +
            `👗 <b>Faol mahsulotlar:</b> ${productsCount} ta\n` +
            `👥 <b>Telegram mijozlari:</b> ${customers.length} ta\n` +
            `📍 <b>Saqlangan lokatsiyalar:</b> ${withLocations} ta\n` +
            `🕒 <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}`
          );
          continue;
        } else if (lowerText.startsWith('/orders')) {
          if (orders.length === 0) {
            await sendTelegramMessage(
              { ...config, chatId },
              `📦 Hozircha yangi buyurtmalar mavjud emas.`
            );
          } else {
            const recent = orders.slice(0, 5);
            const list = recent
              .map(
                (o, idx) =>
                  `${idx + 1}. <b>#${o.orderNumber || o.id}</b> — ${o.customerName}\n` +
                  `   📞 ${o.phone} | 📍 ${o.city}\n` +
                  `   💰 ${(o.totalAmount || 0).toLocaleString('uz-UZ')} so'm (${o.orderStatus})`
              )
              .join('\n\n');

            await sendTelegramMessage(
              { ...config, chatId },
              `📦 <b>SO'NGGI BUYURTMALAR (Top 5):</b>\n` +
              `━━━━━━━━━━━━━━━━━━━━━\n` +
              list
            );
          }
          continue;
        } else if (lowerText.startsWith('/promo')) {
          await sendTelegramMessage(
            { ...config, chatId },
            customerPromoText,
            'HTML',
            customerKeyboard
          );
          continue;
        } else if (lowerText.startsWith('/site')) {
          await sendTelegramMessage(
            { ...config, chatId },
            `🌐 <b>ModeStyle rasmiy onlayn do'koni:</b>\n${siteUrl}\n\nSifatli kiyimlar va qulay xarid!`
          );
          continue;
        }
      }

      // 3. SECURITY: If regular user tries /status or /orders
      if (
        !isAdmin &&
        (lowerText.startsWith('/status') || lowerText.startsWith('/orders') || lowerText.startsWith('/statistika'))
      ) {
        await sendTelegramMessage(
          { ...config, chatId },
          `🔒 <b>Kechirasiz, bu buyruq faqat do'kon ma'muriyati uchun!</b>`,
          'HTML',
          {
            inline_keyboard: [
              [
                { text: '🛍 Saytga kirish', url: siteUrl },
              ],
            ],
          }
        );
        continue;
      }

      // 4. USER INITIATES /START, /REKLAMA, /MENU, /YANGILASH
      if (
        lowerText.startsWith('/start') ||
        lowerText === 'salom' ||
        lowerText === 'assalomu alaykum' ||
        lowerText === '/menu' ||
        lowerText === '/yangilash' ||
        lowerText === '/update'
      ) {
        const custProfile = getStoredTelegramCustomers().find((c) => c.chatId === chatId);

        // If force updating or no phone
        if (lowerText === '/yangilash' || lowerText === '/update' || !custProfile?.phone) {
          await sendTelegramMessage(
            { ...config, chatId },
            `Assalomu alaykum, <b>${senderFirstName || 'qadrli do\'stimiz'}</b>! 🛍\n\n` +
            `<b>ModeStyle.uz</b> rasmiy onlayn do'koniga xush kelibsiz.\n\n` +
            `Buyurtmalaringizni tezkor qabul qilishimiz uchun telefon raqamingizni yuboring:`,
            'HTML',
            getPhoneKeyboard()
          );
          continue;
        }

        // If has phone but no location
        if (!custProfile?.location) {
          await sendTelegramMessage(
            { ...config, chatId },
            `Assalomu alaykum, <b>${senderFirstName || 'qadrli do\'stimiz'}</b>! 🛍\n\n` +
            `Tovar <b>2-3 soatda</b> tezkor yetkazib berilishi uchun <b>lokatsiyangizni yuboring 📍</b>:`,
            'HTML',
            getLocationKeyboard()
          );
          continue;
        }

        // Both phone and location are already registered!
        // Remove keyboard so the chat is clean!
        await sendTelegramMessage(
          { ...config, chatId },
          `✅ <b>SIZNING MA'LUMOTLARINGIZ:</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 <b>Mijoz:</b> ${senderName}\n` +
          `📞 <b>Telefon:</b> <code>${custProfile.phone}</code>\n` +
          `📍 <b>Manzil:</b> Aniq koordinata saqlangan\n\n` +
          `🟢 <b>Operator hozir online!</b>\n` +
          `Savollaringiz yoki xabaringizni shu yerga bemalol yozishingiz mumkin. Operatorimiz to'g'ridan-to'g'ri bot orqali javob beradi 💬`,
          'HTML',
          {
            inline_keyboard: [
              [
                { text: '🛍 Saytga kirish', url: siteUrl },
                { text: "🔄 Ma'lumotlarni yangilash", callback_data: 'update_info' },
              ],
            ],
          }
        );
        continue;
      }

      // 5. IN-BOT CONVERSATION: Customer writes regular text message
      // Store in customer message history
      addCustomerMessage(chatId, 'customer', text);

      // Acknowledge immediately to customer inside the bot
      await sendTelegramMessage(
        { ...config, chatId },
        `✅ <b>Xabaringiz operatorga yetkazildi!</b>\n\n` +
        `Operatorimiz hozir bot orqali javob yozadi. Iltimos, kuting... 💬`,
        'HTML'
      );

      // Relay customer message to Admin with reply instructions
      if (primaryAdminChatId && !isAdmin) {
        const currentCust = getStoredTelegramCustomers().find((c) => c.chatId === chatId);
        const phoneDisplay = currentCust?.phone || 'Telefon kiritilmagan';

        await sendTelegramMessage(
          { ...config, chatId: primaryAdminChatId },
          `💬 <b>MIJOZDAN YANGI XABAR:</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 <b>Mijoz:</b> ${senderName} (${senderUsername || "Username yo'q"})\n` +
          `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
          `📞 <b>Telefon:</b> <code>${phoneDisplay}</code>\n` +
          `🕒 <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `💭 "<b>${text}</b>"\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `✍️ <b>Javob berish usullari:</b>\n` +
          `• Ushbu xabarga <b>Reply (Javob)</b> qiling\n` +
          `• Yoki: <code>/reply ${chatId} Sizning javobingiz</code>\n` +
          `• Yoki: <code>/chat ${chatId}</code>\n` +
          `• Yoki saytdagi Admin paneldan yozing`
        );
      }
    }
  } catch (err) {
    console.error('Error in processTelegramBotUpdates:', err);
  }
}

