//глобальные переменные для состояний открытия доп. информации, массив всех сделок
const isDisabled = {};
const totalData = [];

//метод для установки состояний
function setIsDisabled(DataId){
    isDisabled[DataId] = true;
}

//метод для установки всех сделок
function setTotalData(Data) {
    Data.forEach((item) => item.forEach((subItem) => totalData.push(subItem)));
    console.log(totalData);
}

//функция для скрытия доп информации
function removeInfoHandler(DataId){
    isDisabled[DataId] = true;
    document.getElementById(`infoHead_${DataId}`).remove();
    document.getElementById(`infoContent_${DataId}`).remove();
}

//функция для показа доп информации
function cardInfoClickHandler(Data, Id) {
    const container = document.getElementById('tableBody');
    //если карточка закрыта - открываем, иначе - закрываем
    if(isDisabled[Data[Id].id]){
        //ставим состояние открытия на "открыт", закрываем всё остальное 
        isDisabled[Data[Id].id] = false;
        totalData.filter((item) => item.id != Data[Id].id).forEach((item) => {
            try{
               removeInfoHandler(item.id); 
            } catch{}
        })

        //находим след строку, пред которой будем вставлять доп инфу
        //в случае последнего элемента ловим исключение и передаём 0, создаем новую строку таблицы для доп информации
        let nextRowID = 0
        try{
            nextRowID = totalData[totalData.indexOf(totalData.filter((item) => item.id === Data[Id].id)[0]) + 1].id;
        } catch{}
        const nextRow = document.getElementById(`row_${nextRowID}`);

        //создаём элементы для заголовков и содержания строки доп инфы
        const newElementHeadContainer = document.createElement('tr');
        newElementHeadContainer.setAttribute('id', `infoHead_${Data[Id].id}`);
        const newElementContainer = document.createElement('tr');
        newElementContainer.setAttribute('id', `infoContent_${Data[Id].id}`);

        //заготовки данных для заголовков и содержания доп инфы
        const nodes = ['Дата', 'Статус последней задачи'];
        const contents = [
            new Date(Data[Id].created_at * 1000)
                .toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
            Data[Id].closest_task_at * 1000
        ];
        for(let i = 0; i < 2; i++){
            //создаём заголовки информации
            const newHeader = document.createElement('th');
            const headerNode = document.createTextNode(nodes[i]);
            newHeader.appendChild(headerNode);
            newElementHeadContainer.appendChild(newHeader);
            container.appendChild(newElementHeadContainer);
            container.insertBefore(newElementHeadContainer ,nextRow);

            //создаём содержание информации
            //i - индекс, по которому определяется, дата это или статус
            const newItemDescEl = document.createElement('td');
            if(i === 0){
                const newInfoContent = document.createTextNode(contents[i]);
                newItemDescEl.appendChild(newInfoContent);
            }
            else{
                //создаём svg-круг, в зависимости от даты задачи закрашиваем в цвет
                const newSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                const svgNS = newSVG.namespaceURI;
                const svgCircle = document.createElementNS(svgNS, 'circle');
                svgCircle.setAttribute('r', '25');
                svgCircle.setAttribute('cx', '25');
                svgCircle.setAttribute('cy', '25');
                if(contents[i] - Date.now() > 86400000){
                    svgCircle.style.fill = '#ffc93c';
                }
                else if(contents[i] - Date.now() > 0){
                    svgCircle.style.fill = '#42b883';
                }
                else {
                    svgCircle.style.fill = '#f95959';
                }
                newSVG.appendChild(svgCircle);
                newItemDescEl.appendChild(newSVG);
            }
            newElementContainer.appendChild(newItemDescEl);
        }
        
        //создаём кнопку для сворачивания карточки
        const newBtn = document.createElement('button');
        newBtn.setAttribute('class', 'btn btn-primary');
        newBtn.setAttribute('onclick', `removeInfoHandler(${Data[Id].id})`)
        const BtnContent = document.createTextNode('свернуть содержимое');
        newBtn.appendChild(BtnContent);
        newElementContainer.appendChild(newBtn);
        
        container.appendChild(newElementContainer);
        container.insertBefore(newElementContainer, nextRow);    
    }
    else{
        removeInfoHandler(Data[Id].id);
    }
}
