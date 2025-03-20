const host = "http://localhost:8000";

function formatDate(isoString) {
    // Убираем микросекунды из строки
    const dateWithoutMicroseconds = isoString.split('.')[0]; // Разделяем по точке и оставляем только основную часть
    const dateObj = new Date(dateWithoutMicroseconds);

    if (isNaN(dateObj.getTime())) {
        console.error("Некорректная дата:", isoString);
        return "Ошибка при формате даты";
    }

    return dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const commentsList = document.getElementById("comments-list");
    const commentForm = document.getElementById("commentForm");

    // Функция загрузки комментариев
    async function loadComments() {
        try {
            console.log("Загрузка комментариев... "+host+"/comments");
            const response = await fetch(host + "/comments")
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            const comments = await response.json();
            console.log(comments[0].created_at);

            const commentsContainer = document.getElementById("commentsContainer");
            commentsContainer.innerHTML = '';
            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');
        
                const commentHeader = document.createElement('div');
                commentHeader.classList.add('comment-header');
                commentHeader.textContent = comment.name;
        
                const commentContent = document.createElement('div');
                commentContent.classList.add('comment-content');
                commentContent.textContent = comment.content;
        
                const commentDate = document.createElement('div');
                commentDate.classList.add('comment-date');
                commentDate.textContent = formatDate(comment.created_at);
        
                commentElement.appendChild(commentHeader);
                commentElement.appendChild(commentContent);
                commentElement.appendChild(commentDate);
        
                commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error("Ошибка загрузки комментариев:", error);
        }
    }

    // Функция отправки комментария
    document.getElementById("commentForm").addEventListener("submit", async function (event) {
        event.preventDefault();
    
        const name = document.getElementById("commentName").value.trim();
        const content = document.getElementById("commentContent").value.trim();
    
        if (!name || !content) {
            alert("Заполните все поля!");
            return;
        }
    
        try {
            let response = await fetch("http://localhost:8000/comments?name="+name+"&content="+content, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            });
    
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
    
            alert("Комментарий отправлен!");
            document.getElementById("commentForm").reset();
            loadComments(); // Перезагрузить список комментариев
        } catch (error) {
            console.error("Ошибка запроса:", error);
            console.error("Текст ошибки:", error.message);
            alert("Ошибка при отправке комментария!");
        }
    });

    loadComments();
});

async function loadVacancies() {
    try {
        let response = await fetch("http://localhost:8000/vacancies"); // Запрос к API
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        
        let vacancies = await response.json(); // Получаем JSON с вакансиями
        let select = document.getElementById("position"); // Находим селект

        select.innerHTML = '<option value="">Выберите вакансию</option>'; // Очищаем перед вставкой

        vacancies.forEach(vacancy => {
            let option = document.createElement("option");
            option.value = vacancy.toLowerCase(); // Устанавливаем значение (например, "разработчик")
            option.textContent = vacancy; // Отображаемый текст
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Ошибка загрузки вакансий:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadVacancies); // Загружаем при загрузке страницы

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("joinForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // Предотвращаем стандартное поведение формы

        // Получаем значения полей формы
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const position = document.getElementById("position").value.trim();

        // Проверяем обязательные поля
        if (!firstName || !lastName || !email || !position) {
            document.getElementById("formMessage").textContent = "Заполните все обязательные поля!";
            document.getElementById("formMessage").style.color = "red";
            return;
        }

        try {
            // Формируем строку запроса
            let queryParams = new URLSearchParams({
                name: firstName,
                surname: lastName,
                email: email,
                vacancy: position
            });

            if (phone) {
                queryParams.append("phone", phone);
            }

            let response = await fetch(host+`/application_to_join?${queryParams.toString()}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            // Очищаем форму
            document.getElementById("joinForm").reset();
            document.getElementById("formMessage").textContent = "Заявка успешно отправлена!";
            document.getElementById("formMessage").style.color = "green";

        } catch (error) {
            console.error("Ошибка при отправке заявки:", error);
            document.getElementById("formMessage").textContent = "Ошибка при отправке заявки!";
            document.getElementById("formMessage").style.color = "red";
        }
    });
});
