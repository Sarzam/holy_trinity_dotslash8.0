import { createCanvas } from 'canvas';
import crypto from 'crypto';

export async function GET() {
  try {
    // Initialize global CAPTCHA store if it doesn't exist
    if (!global.captchaStore) {
      global.captchaStore = {};
    }

    // Generate CAPTCHA text (6 characters)
    const captchaText = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Generate unique token
    const captchaToken = crypto.randomBytes(32).toString('hex');
    
    // Store CAPTCHA with token
    global.captchaStore[captchaToken] = captchaText;
    
    console.log('Generated CAPTCHA:', { token: captchaToken, text: captchaText }); // Debug log

    // Create canvas for CAPTCHA image
    const canvas = createCanvas(200, 70);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 70);

    // Add noise (lines)
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 200, Math.random() * 70);
      ctx.lineTo(Math.random() * 200, Math.random() * 70);
      ctx.stroke();
    }

    // Add CAPTCHA text
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(captchaText, 100, 35);

    // Convert canvas to base64
    const captchaImage = canvas.toBuffer('image/png').toString('base64');

    // Clean up old CAPTCHAs (older than 5 minutes)
    const now = Date.now();
    Object.keys(global.captchaStore).forEach(key => {
      if (now - global.captchaStore[key].timestamp > 5 * 60 * 1000) {
        delete global.captchaStore[key];
      }
    });

    return new Response(
      JSON.stringify({ captchaImage, captchaToken }),
      { status: 200 }
    );
  } catch (error) {
    console.error('CAPTCHA generation error:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to generate CAPTCHA' }),
      { status: 500 }
    );
  }
}
