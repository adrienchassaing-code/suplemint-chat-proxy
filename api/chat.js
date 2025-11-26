export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, conversationId } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages manquant ou invalide' });
      return;
    }

    const apiKey = process.env.CHATBASE_API_KEY;
    const botId = process.env.CHATBASE_BOT_ID;

    if (!apiKey || !botId) {
      res.status(500).json({
        error: 'Variables CHATBASE_API_KEY ou CHATBASE_BOT_ID manquantes',
      });
      return;
    }

    const response = await fetch('https://www.chatbase.co/api/v1/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatbotId: botId,
        messages,
        conversationId: conversationId || undefined,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Chatbase:', errorText);
      res
        .status(500)
        .json({ error: 'Erreur depuis Chatbase', details: errorText });
      return;
    }

    const data = await response.json();

    // Adapte au besoin si Chatbase renvoie "answer" ou autre
    const reply =
      data.message ||
      data.text ||
      JSON.stringify(data, null, 2);

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne /api/chat' });
  }
}
