document.addEventListener('DOMContentLoaded', function() {
    const voteButtons = document.querySelectorAll('.vote-button');

    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dinosaurId = this.dataset.id;

            fetch(`/dinosaurs/vote/${dinosaurId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const voteCountElement = document.querySelector(`#votes-${dinosaurId}`);
                    voteCountElement.textContent = data.newVoteCount;
                } else {
                    alert('Error voting for dinosaur.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    const fetchDinosaursButton = document.getElementById('fetch-dinosaurs');

    fetchDinosaursButton.addEventListener('click', function() {
        fetch('/dinosaurs/fetch')
            .then(response => response.json())
            .then(data => {
                const dinosaurList = document.getElementById('dinosaur-list');
                dinosaurList.innerHTML = '';

                data.dinosaurs.forEach(dinosaur => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <h3>${dinosaur.name}</h3>
                        <img src="${dinosaur.imageUrl}" alt="${dinosaur.name}">
                        <p>Votes: <span id="votes-${dinosaur.id}">${dinosaur.votes}</span></p>
                        <button class="vote-button" data-id="${dinosaur.id}">Vote</button>
                    `;
                    dinosaurList.appendChild(listItem);
                });
            })
            .catch(error => {
                console.error('Error fetching dinosaurs:', error);
            });
    });
});