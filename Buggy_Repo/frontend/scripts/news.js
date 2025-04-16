const rssConverter = "https://api.rss2json.com/v1/api.json?rss_url=";
const feeds = [
  { name: "bbc", url: "https://feeds.bbci.co.uk/news/world/rss.xml" }, //Added s to http 
  { name: "guardian", url: "https://www.theguardian.com/international/rss" }
];
let allArticles = [];

async function loadNews(searchTerm = "", source = "all", reset = false) {
  const list = document.getElementById("newsList");
  const loading = document.getElementById("loading");
  
  if (reset) {
    allArticles = [];
    list.innerHTML = "";
  }
  
  loading.style.display = "block";
  
  try {
    const selectedFeeds = source === "all" ? feeds : feeds.filter(f => f.name === source);
    
    for (const feed of selectedFeeds) {
      const res = await fetch(`${rssConverter}${encodeURIComponent(feed.url)}`);
      if (!res.ok) throw new Error(`Failed to fetch ${feed.name}`);
      const data = await res.json();
      
      // Added safety check for data format
      if (!data || !Array.isArray(data.items)) {
        console.warn(`Invalid data format from ${feed.name}`);
        return [];
      }
      
      const articles = data.items.map(item => ({
        title: item.title || "No title",
        description: item.description ? 
          // Strip HTML tags from description for cleaner display
          item.description.replace(/<\/?[^>]+(>|$)/g, "") : 
          "No description",
        url: item.link || "#",
        source: feed.name.toUpperCase(),
        pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Unknown",
        // Added image if available
        image: item.enclosure?.link || item.thumbnail || null
      }));
      
      allArticles.push(...articles);
    }
    
    // Sort articles by date (newest first)
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    const filteredArticles = searchTerm
      ? allArticles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allArticles;
    
    document.getElementById("articleCount").textContent = `Total articles: ${filteredArticles.length}`;
    
    list.innerHTML = "";
    // Check if there are any articles matching the search criteria
    if (filteredArticles.length === 0) {
      // Display a message when no articles are found
      list.innerHTML = '<div class="no-results">No articles found matching your criteria</div>';
    } else {
      // Loop through each article and create UI elements
      filteredArticles.forEach(article => {
        // Create a container div for each article
        const div = document.createElement("div");
        // Assign CSS class for styling
        div.className = "news-item";
        // Build the HTML content for each article
        div.innerHTML = `
          <!-- Article title with link to original source -->
          <h3><a href="${article.url}" target="_blank" rel="noopener">${article.title}</a></h3>
          <!-- Metadata showing source and publication date -->
          <p class="news-meta"><strong>Source:</strong> ${article.source} | 
             <strong>Date:</strong> ${article.pubDate}</p>
          <!-- Conditionally display image if available -->
          ${article.image ? `<img src="${article.image}" alt="" class="news-thumbnail">` : ''}
          <!-- Display article description/summary -->
          <p class="news-description">${article.description}</p>
        `;
        // Add the article to the news list container
        list.appendChild(div);
      });
    }
    
  } catch (err) {
    // Log the error to console for debugging
    console.error("News loading error:", err);
    // Display error message to user
    list.innerHTML += `<p style="color: red;">Error: ${err.message}</p>`;
  } finally {
    // Hide loading indicator when operation completes (whether successful or not)
    loading.style.display = "none";
  }
}

// Initial call to load news when page loads
loadNews();