document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll('.star');

    stars.forEach(star => {
        star.addEventListener('mouseover', function () {
            const starValue = this.getAttribute('for').split('-')[0];
            stars.forEach(s => {
                if (parseInt(s.getAttribute('for').split('-')[0]) <= starValue) {
                    s.style.color = '#f5b301';
                } else {
                    s.style.color = '#ccc';
                }
            });
        });

        star.addEventListener('mouseout', function () {
            const checkedValue = document.querySelector('input[name="rating"]:checked');
            const starValue = checkedValue ? checkedValue.value : 0;
            stars.forEach(s => {
                if (parseInt(s.getAttribute('for').split('-')[0]) <= starValue) {
                    s.style.color = '#f5b301';
                } else {
                    s.style.color = '#ccc';
                }
            });
        });

        star.addEventListener('click', function () {
            const starValue = this.getAttribute('for').split('-')[0];
            document.querySelector(`input[name="rating"][value="${starValue}"]`).checked = true;
        });
    });

    fetchReviews();

    document.getElementById("input-submit").addEventListener("click", function () {
        let review = document.getElementById("input").value;
        const stars = document.querySelector('input[name="rating"]:checked').value;

        if (!stars) return;
        if (!review) review = "N/A";

        if (review && stars) {
            submitReview(review, stars);
            document.getElementById("input-submit").innerHTML = "Sent"
            document.getElementById("input-submit").style.backgroundColor = 'grey'
        }
    }, { once: true });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            let review = document.getElementById("input").value;
            const stars = document.querySelector('input[name="rating"]:checked').value;

            if (!stars) return;
            if (!review) review = "N/A";

            if (review && stars) {
                submitReview(review, stars);
                document.getElementById("input-submit").innerHTML = "Sent"
                document.getElementById("input-submit").style.backgroundColor = 'grey'
            }
        }
    });
});


function fetchReviews() {
    fetch('/api/fetch-reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            displayReviews(data.reviews);
        });
}

function submitReview(review, stars) {
    fetch('/api/save-review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review, stars })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchReviews();
                document.getElementById("input").value = '';
                document.querySelector('input[name="rating"]:checked').checked = false;
            }
        });
}

function displayReviews(reviews) {
    const reviewContainer = document.getElementById("review-list");
    const averageReview = document.getElementById("averageReview")
    reviewContainer.innerHTML = '';

    let total = 0

    reviews.forEach(review => {
        const reviewElement = document.createElement("div");
        reviewElement.className = "grid-item";
        reviewElement.innerHTML = `
            <p>${review.review}</p>
            <p>Rating: ${'&#9733;'.repeat(review.stars)}${'&#9734;'.repeat(5 - review.stars)}</p>`;
        reviewContainer.appendChild(reviewElement);
        total += parseInt(review.stars);
    });

    var average = Math.round(total / reviews.length * 100) / 100

    averageReview.innerHTML = `Our average ⭐ rating: ${average}/5 (${reviews.length} reviews)`
}
