import tokens from './tokens.json'

//двумерный массив всех сделок
const totalData = [];
//скрываем таблицу до завершения загрузки
const table = document.getElementById('table');
table.setAttribute('hidden', '');
const container = document.getElementById('tableBody');

//промис, по окончанию которого снимаем спиннер и преобразуем двумерный массив в одномерный, отправляем в cardInfoHandler.js
new Promise((resolve) => {
    //все промисы запросов для отслеживания их общего завершения
    const totalPromises = [];
    for(let k = 1; k < 9999; k++){
        //отправляем запрос на получение 2-х карточек с контактами, ждём 1 секунду
        setTimeout(() => {
            totalPromises.push(fetch(`https://thingproxy.freeboard.io/fetch/https://gasterdreemyr.amocrm.ru/api/v4/leads?limit=2&&with=contacts&&page=${k}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`
                },
            })
                .then(response => response.json())
                .then(response => response._embedded.leads)
            .then((Data) => {
                //выводим данные из Api для отладки, добавляем в двумерный массив
                console.log(Data);
                totalData.push(Data);
                for(let i = 0; i < Data.length; i++){
                    //для каждой сделки инициализируем состояние открытия информации
                    setIsDisabled(Data[i].id);
                    
                    //создаём новую строку таблицы со сделкой
                    const rowContainer = document.createElement('tr');
                    rowContainer.setAttribute('id', `row_${Data[i].id}`);
                    rowContainer.setAttribute('onclick', `cardInfoClickHandler(${JSON.stringify(Data)}, ${i})`);

                    //заголовок линии таблицы (id)
                    const rowHead = document.createElement('th');
                    const rowHeadContent = document.createTextNode(Data[i].id.toString());
                    rowHead.appendChild(rowHeadContent);
                    rowHead.setAttribute('scope', 'row');
                    rowContainer.appendChild(rowHead);

                    //добавляем значения имени и бюджета
                    const attrs = [Data[i].name, Data[i].price];
                    function fillRow() {
                        for(let itemID = 0; itemID < attrs.length; itemID++){
                            const rowElement = document.createElement('td');
                            const rowElementContent = document.createTextNode(attrs[itemID]);
                            rowElement.appendChild(rowElementContent);
                            rowContainer.appendChild(rowElement);
                        }
                    }

                    //добавляем инфу об основном контакте, если такая существует, отправляем запрос на данные о контакте
                    if(Data[i]._embedded.contacts.filter((item) => item.is_main === true)[0] !== undefined){
                        totalPromises.push(fetch(`https://thingproxy.freeboard.io/fetch/https://gasterdreemyr.amocrm.ru/api/v4/contacts/${Data[i]
                            ._embedded.contacts[0].id}`,{
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${tokens.access_token}`
                            },
                        })
                            .then(response => response.json())
                            .then(response => {
                                //дополнительная обработка исключений на случай пустых значений
                                //каждое поле в отдельном try на случай незаполненности только одного из полей
                                try{
                                    attrs.push(response.name);
                                } catch{}
                                try{
                                    attrs.push(response.custom_fields_values[0].values[0].value);
                                } catch{}
                                fillRow();
                                //завершаем основной промис по окончанию всех запросов,
                                //timeout установлен для предотвращения раннего срабатывания
                                setTimeout(() => Promise.all(totalPromises).finally(() => resolve()), 1000);
                            }));
                    }
                    else{fillRow();}
                    container.appendChild(rowContainer);
                }
                //завершаем псевдо-бесконечный цикл по получению всех сделок
            }, () => k = 10000))
        }, k * 1000);
    }
}).finally(() => {
    document.getElementById('tableSpin').setAttribute('hidden', '');
    table.removeAttribute('hidden');
    setTotalData(totalData);
});

