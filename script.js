(() => {
    const searchInput = document.querySelector(".searchInput");
    const input = searchInput.querySelector("input");
    const randBtn = searchInput.querySelector("button");
    const searchResult = document.querySelector(".searchResult");

    const API_ENDPOINT = "https://api.thecatapi.com/v1";
    // 받아온 고양이 데이터
    let data = null;

    const tryFetch = async(url) => {
        try {
            const result = await fetch(url);
            return result.json();
        } catch (error) {
            console.log(`error message: ${error}`);
        }
    };

    // 고양이 사진 불러오기
    const fetchCats = async(keyword) => {
        try {
            const breeds = await tryFetch(
                `${API_ENDPOINT}/breeds/search?q=${keyword}`
            );
            const results = breeds.map(async(breed) => {
                return await tryFetch(
                    `${API_ENDPOINT}/images/search?limit=50&breed_ids=${breed.id}`
                );
            });

            const response = await Promise.all(results);
            const arr = response.reduce((acc, cur) => {
                acc = acc.concat(cur);
                return acc;
            }, []);
            return arr;
        } catch (error) {
            console.log(`error message: ${error}`);
        }
    };

    const fetchRandCats = async() => {
        try {
            const results = await tryFetch(`${API_ENDPOINT}/images/search?limit=100`);
            data = results;
            printData();
        } catch (error) {
            console.log(`error message: ${error}`);
        }
    };

    // lazyload인데 되고 있는 걸까
    const lazyload = () => {
        const options = { threshold: 0 };
        const callback = (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    entry.target.src = entry.target.dataset.src;
                }
            });
        };
        const io = new IntersectionObserver(callback, options);
        const lazyImages = Array.from(document.getElementsByClassName("lazy"));
        lazyImages.forEach((image) => {
            io.observe(image);
        });
    };

    // 데이터 출력하기
    const printData = () => {
        let result = "";
        data.map((cat) => {
            result += `
                <article class="card" data-id=${cat.id}>
                    <img class="lazy" data-src=${cat.url} src=""/>
                </article>
            `;
        });

        if (result.length > 0) {
            const div = document.createElement("div");
            div.innerHTML = result;
            div.className = "card-container";
            searchResult.innerHTML = "";
            searchResult.appendChild(div);
        } else {
            searchResult.innerHTML = "<p>😓 No results</p>";
        }

        lazyload();
    };

    // input 비우기
    const removeInputValue = () => {
        input.value = "";
    };

    // input 키워드 검색
    const handleEnter = async(e) => {
        if (e.keyCode === 13) {
            searchResult.innerHTML = `<p>Loading ...</p>`;
            data = await fetchCats(input.value);
            printData();
        }
    };

    input.addEventListener("click", removeInputValue);
    input.addEventListener("keyup", handleEnter);
    randBtn.addEventListener("click", fetchRandCats);
})();