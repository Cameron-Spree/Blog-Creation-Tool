export async function getYoutubeTranscript(url) {
  try {
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : url;

    // Fetch the YouTube page HTML
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await res.text();

    // Find the Captions payload hidden in the HTML script tags
    const captionsRegex = /"captions":({.*?})/;
    const match = html.match(captionsRegex);

    if (!match) throw new Error('No transcript available for this video.');

    const captionsJson = JSON.parse(match[1]);
    const tracks = captionsJson?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks || tracks.length === 0) throw new Error('No transcript tracks found.');

    // Get the first available transcript URL (usually English)
    const transcriptUrl = tracks[0].baseUrl;

    // Fetch the actual XML transcript
    const transcriptRes = await fetch(transcriptUrl);
    const transcriptXml = await transcriptRes.text();

    // Parse the XML text into a single string
    const textRegex = /<text[^>]*>(.*?)<\/text>/g;
    let fullText = '';
    let textMatch;
    
    while ((textMatch = textRegex.exec(transcriptXml)) !== null) {
      // Decode HTML entities
      const decodedLine = textMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');
      
      fullText += decodedLine + ' ';
    }

    return fullText.trim();
  } catch (err) {
    throw new Error(`Transcript extraction failed: ${err.message}`);
  }
}
