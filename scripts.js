const Modal = {
    open() {
        //abrir modal
        //adicionar classe active ao modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        //fechar modal
        //retirar classe active
        document.querySelector('.modal-overlay').classList.remove('active')

    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transaction) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(Transaction.all))
    }
}

const Transaction = {
    all: Storage.get(),
    add: (transaction) => {
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        //somar as entradas
        let income = 0
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })

        return income
    },
    expenses() {
        //soma as saidas
        let expense = 0
        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense

    },
    total() {
        //calcular o total
        //entradas - saidas

        return Transaction.incomes() + Transaction.expenses()
    }
}
const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "") //troque tudo que não for numro para nada

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },
    formatAmount(value) {
        value = Number(value) * 100

        return value
    },
    formatDate(date) {
        const splittedDate = date.split("-")

        return splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0]
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSClass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const Html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSClass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onClick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
        `
        return Html
    },

    updateBalance() {
        document.getElementById('income-display').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expense-display').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('total-display').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }

}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description, amount, date
        }
    },
    validateField() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor preencha todos os campos")
        }
    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()

        //na validação é possivel que ocorra um erro
        //nesse caso tente executar, se der erro mande um alert
        try {
            Form.validateField()
            const transaction = Form.formatValues()

            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
            App.reload()

        } catch (error) {
            alert(error.message)
        }
    }
}


const App = {
    init() {

        /*
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })*/
        Transaction.all.forEach(DOM.addTransaction) //faz a mesma coisa do que a parte comentada acima

        DOM.updateBalance();
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()