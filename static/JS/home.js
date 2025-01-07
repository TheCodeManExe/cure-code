const messages = [
  `<span id="primary-banner-text" class="banner-text" style="color: white; text-decoration: none;" href="/">
      Welcome to Cure Code!
    </span>`,
  `<span id="primary-banner-text" class="banner-text" style="color: white; text-decoration: none;" href="/">
      Cure code is a website highlighting the importance of AI in the medical field.
  </span>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/museum">
      Visit our digital museum
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/museum">
      With over 50MB of valuable information!
    </a>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/our-vision">
      Read about our vision!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/our-vision">
      We aim to make significant changes in the medical field!.
    </a>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/health-horizon">
      Meet our state of the art AI called 'Health Horizon'!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/health-horizon">
      With capabilities to generate terabytes of information! 
    </a>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/about-us">
      Read about us!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/about-us">
      We are a group of 6 developers.
    </a>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/pathogen-protocol">
      Try out our new game 'Pathogen Protocol'!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/pathogen-protocol">
      Defeat the viruses using various tools!
    </a>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/case-studies">
      Take a look at our case studies!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/case-studies">
      They provide many valuable insights!
    </a>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/expert-talk">
       Check out our interviews with people who revolutionized the medical field!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/expert-talk">
      They are the reason we are this advanced in healthcare!.
    </a>`,

  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/trivia">
      Test your medical knowledge with our trivia game!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/trivia">
      With over 200 baffling questions!
    </a>`,
  `<a id="primary-banner-text" class="banner-text" style="bottom: 40px; color: white; text-decoration: none;" href="/reviews">
      Leave us a review!
    </a>
    <br>
    <a id="secondary-banner-text" class="banner-text" style="top:40px; color: white; text-decoration: none;" href="/reviews">
      We hope you enjoyed and will leave us a good review!
    </a>`,
  function(average) {
    return `
      <span id="primary-banner-text" class="banner-text" style="color: white; text-decoration: none;" href="/">
        Our average ⭐ rating: ${average.toFixed(2)}/5
      </span>
    `;
  }
];

let currentIndex = 0;
const banner = document.getElementById('banner');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function fetchReviews() {
  return fetch('/api/fetch-reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => averageReviews(data.reviews));
}

function averageReviews(reviews) {
  let total = 0;
  reviews.forEach(review => {
    total += parseInt(review.stars);
  });
  return total / reviews.length;
}

function changeText(average, direction = 1) {
  banner.style.opacity = 0;

  setTimeout(() => {
    currentIndex = (currentIndex + direction + messages.length) % messages.length;
    const message = messages[currentIndex];

    if (typeof message === 'function') {
      banner.innerHTML = message(average);
    } else {
      banner.innerHTML = message;
    }

    banner.style.opacity = 1;
  }, 500);
}

fetchReviews().then(average => {
  const initialMessage = messages[currentIndex];
  if (typeof initialMessage === 'function') {
    banner.innerHTML = initialMessage(average);
  } else {
    banner.innerHTML = initialMessage;
  }

  setInterval(() => changeText(average), 5000);

  prevBtn.addEventListener('click', () => changeText(average, -1));
  nextBtn.addEventListener('click', () => changeText(average, 1));
});
