const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("proti.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("proti.finances:transactions", JSON.stringify(transactions));
    }
}

const Modal = {
    open(){
        const modal = document.querySelector('.modal-overlay')
        modal.classList.add('active')
    },
    close(){
        const modal = document.querySelector('.modal-overlay')
        modal.classList.remove('active')
    },
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach((transaction) => {
            income = transaction.amount > 0 ? income + transaction.amount : income + 0;
        })

        //income = income.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        return income;
    },
    expanses() {
        let expanse = 0;
        Transaction.all.forEach((transaction) => {
            expanse = transaction.amount < 0 ? expanse + transaction.amount : expanse + 0;
        });

        //expanse = expanse.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        return expanse;
    },
    total() {
        return this.incomes() + this.expanses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expanse';

        const amount = utils.fomartCurrency(transaction.amount);

        const html = `<tr>
                        <td class="description">${transaction.description}</td>
                        <td class="${CSSclass}">${amount}</td>
                        <td class="date">${transaction.date}</td>
                        <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
                      </tr>`

        return html;
    },

    updateBalance() {
        document.querySelector('#expanse-display').innerHTML = utils.fomartCurrency(Transaction.expanses());
        document.querySelector('#income-display').innerHTML = utils.fomartCurrency(Transaction.incomes());
        document.querySelector('#total-display').innerHTML = utils.fomartCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }, 

    colorTotalValue() {
        let totalCard = document.querySelector('.card.total');
        
        if(Transaction.total() < 0) {
            totalCard.style.backgroundColor = 'var(--red)'
        } else {
            totalCard.style.backgroundColor = 'var(--card-total)'
        }

    }
} 

const utils = {
    fomartCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, '');

        value = Number(value) / 100;

        value = value.toLocaleString('pt-BR', {style: 'currency',currency: 'BRL'});

        return signal + value
    },
    formatAmount(value) {
        value = Number(value) * 100;
        return value;
    },
    formatDate(date) {
        const splittedDate = date.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields() {
        const{description, amount, date} = Form.getValues();
        if (description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {
        let{description, amount, date} = Form.getValues();

        amount = utils.formatAmount(amount);

        date = utils.formatDate(date);
        
        return {
            description,
            amount,
            date
        }
    },
    clearFields() {
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    },
    submit(event) {
        event.preventDefault();

        try {
            //Verificar campos preenchidos
            Form.validateFields();
            //Armazenar os dados formatados na variavel transaction
            const transaction = Form.formatValues();
            //Adicionar na pagina
            Transaction.add(transaction);
            //Limpar os campos após preencher
            Form.clearFields();
            //Fechar modal 
            Modal.close();

        } catch (error) {
            alert(error.message);
        }
    }
};

const App = {
    init() {       
        Transaction.all.forEach(DOM.addTransaction);
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        DOM.colorTotalValue();
        App.init();
    },
}

const btnMode = document.querySelector('button.dark-ligth');
btnMode.addEventListener('click',() => {
    const pageHtml = document.querySelector('html');
    pageHtml.classList.toggle('dark');
})

App.init();

