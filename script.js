//abre e fecha modal do app
const Modal = {
    open() {
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active")
    },
    close() {
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active")

        document
            .querySelector("#new-data")
            .reset()
    }
}

const Storage = {
    get() {
        //pegando os dados do localStorage e transformando de volta em array []
        return JSON.parse(localStorage.getItem("dev.finances")) || []
    },

    set(transactions) {
        //setando os dados para Local storage em JSON (string)
        localStorage.setItem("dev.finances", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {        
        let income = 0
        //pegar todas as transaçoes e para cada transaçao
        Transaction.all.forEach(transaction => {
            //se ela for maior que 0
            if (transaction.amount > 0) {
                //somar a uma variavel e
                income += transaction.amount    
            }
        })
        // retornar a variavel
        return income
    },

    expenses() {
        let expense = 0
        //pegar todas as transaçoes e para cada transaçao
        Transaction.all.forEach(transaction => {
            //se ela for menos que 0
            if (transaction.amount < 0) {
                //somar a uma variavel e
                expense += transaction.amount
            }
        })
        // retornar a variavel
        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector(".list tbody"),

    addTransaction(transaction, index) {
        //criando a table row (tr) para encapsular o conteúdo 
        //vindo da funçao innerHTMLTransaction
        const tr = document.createElement("tr")
        //atribundo ao interior de 'tr' o conteúdo html vindo de innerHTMLTransaction
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index // não fez diferença colocar essa linha no código para deletar as rows da tabela
        //enviando todo o conteúdo reunido para a tabela .list
        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        //definindo as classes para coloraçao do valor positivo e negativo em tela
        const amountClass = transaction.amount >= 0 ? "income" : "expense"
        //chamando a funçao de formatar tipo de moeda e atribuindo a uma const
        const amount = Utils.formatCurrency(transaction.amount)
        //template do html de cada linha da tabela de valores
        //com os dados dinamicos extraídos do array de objetos 'transactions[]'
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${amountClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img src="./assets/minus.svg" alt="Deletar Transação" onclick="Transaction.remove(${index})" />
            </td>
        `
        return html //retornando o template para ser recebido pela funçao addTransaction()
    },

    updateBalance() {
        document
            .getElementById("incomeDisplay") //buscando os campos de Display (income, expense, total)
            .innerHTML = Utils.formatCurrency(Transaction.incomes()) //colocando os resultados das funçoes do objeto Transaction para serem formatados com a moeda local.
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        //pegando o sinal negativo dos numeros que são menores que 0 
        const signal = Number(value) < 0 ? "-" : ""
        //pegando os valores e com a RegEx alterando tudo que NAO é numero 
        //para um caracter vazio (para poder usar toLocaleString, que só funciona com números)
        value = String(value).replace(/\D/g,"")
        //pegando os valores e dividindo por 100 para obter as casas decimais
        value = Number(value) / 100
        //inserindo a moeda local (BRL) na string
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        //retornando o sinal(String) + o valor com o tipo de moeda(BRL)
        return signal + value
    },

    formatAmount(amount) {
        amount = Number(amount) * 100

        return amount
    },

    formatDate(date) {
        const splitDate = date.split("-")
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    }
}

const Form = {
    description: document.querySelector("#description"),
    amount: document.querySelector("#amount"),
    date: document.querySelector("#date-input"),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        // o .trim() faz uma limpeza de espaços vazios na String
        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("All required fields must be entered.")
            }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        
        return {
            description,
            amount,
            date
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
        try {
            //verificar se todas as informaçoes foram preenchidas
            Form.validateFields()
            //formatar os dados para salvar
            const transaction = Form.formatValues()
            //salvar
            Form.saveTransaction(transaction)
            //apagar os dados do formulario
            Form.clearFields()
            //fechar modal
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {

    init() {
        
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        DOM.updateBalance()
        
        Storage.set(Transaction.all)
        
    },

    reload() {

        DOM.clearTransactions()
        App.init()

    },
}

App.init()

