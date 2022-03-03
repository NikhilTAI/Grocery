const searchBar = document.getElementById('searchBar');
const cards = document.getElementsByClassName('card');

searchBar.addEventListener('keyup', (e) => {
    const searchString = e.target.value.toLowerCase().trim();

    if (searchString == '') {
        // show all
        for (let i = 0; i < cards.length; i++) {
            document.getElementsByClassName('card')[i].style.display = "block";
        }
    } else {
        for (let i = 0; i < cards.length; i++) {
            let name = document.getElementsByClassName('card')[i].childNodes[1].childNodes[3].childNodes[1].innerText.toLowerCase();
            if (name.includes(searchString)) {
            } else {
                document.getElementsByClassName('card')[i].style.display = "none";
            }
        }
    }
});