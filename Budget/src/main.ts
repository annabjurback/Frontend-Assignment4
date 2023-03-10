import { createApp } from 'vue';
// import App from './App.vue'


// import './assets/main.css'

const app = createApp({
    data() {
        return {
            expenseTypes: [
                "Household",
                "Travel",
                "Food",
                "Entertainment",
                "Clothing",
                "Miscellaneous"
            ],
            expense: "",
            amount: 0,
            category: "",
            date: new Date().toISOString().substring(0, 10),
            expenses: [{
                expense: "Cat",
                amount: 10,
                category: "household",
                date: new Date().toISOString().substring(0, 10),
                edit: false
            },
            {
                expense: "Dog",
                amount: 123,
                category: "entertainment",
                date: new Date().toISOString().substring(0, 10),
                edit: false
            } as { expense: string, amount: number, category: string, edit: boolean, date: string }],
            filterOptions: {
                category: "all",
                month: "",
                minimumAmount: 0,
                maximumAmount: 0
            },
            filterSelect: "all",
            selectedMonth: "",
            minimumAmountSelect: 0,
            maximumAmountSelect: 0,
            maxAmountForSliders: 0,
        }
    },
    methods: {
        addExpense() {
            let newItem = {
                expense: this.expense,
                amount: this.amount,
                category: this.category,
                date: this.date,
                edit: false
            };
            this.expenses.push(newItem);
            this.setMaxAmount();
            this.setMaximumSliderValue();
        },
        deleteExpense(index: number) {
            this.expenses.splice(index, 1);
        },
        filterExpenses() {
            this.setMaximumSliderValue();

            let dummy;
            if (this.filterOptions.category === "all") {
                dummy = this.expenses.slice();
            }
            else {
                dummy = this.expenses.filter((ex: { category: string; }) => ex.category === this.filterOptions.category);
            }

            // If cost filter maximum is > 0
            if (this.filterOptions.maximumAmount !== 0)
            {
                dummy = dummy.filter((ex: {amount: number}) => ex.amount >= this.filterOptions.minimumAmount && ex.amount <= this.filterOptions.maximumAmount);
            }
            
            // If month is not an empty string. Apply month filter.
            if(this.filterOptions !== "") {
                dummy = dummy.filter((ex: { date: string}) => ex.date.includes(this.filterOptions.month));
            }
            return dummy;
        },
        setMaxAmount() {
            // ChatGPT helped with this one
            this.maxAmountForSliders = this.expenses.reduce((max: number, currentExpense: any) => {
                return currentExpense.amount > max ? currentExpense.amount : max;
            }, 0); 
        },
        setMinimumSliderValue() {
            if (parseInt(this.maximumAmountSelect) < parseInt(this.minimumAmountSelect)) {
                this.minimumAmountSelect = this.maximumAmountSelect;
            }
        },
        setMaximumSliderValue() {
            if(this.maximumAmountSelect === 0)
            {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
            if (parseInt(this.minimumAmountSelect) > parseInt(this.maximumAmountSelect)) {
                this.maximumAmountSelect = this.minimumAmountSelect;
            }
        },
        applyFilter() {
            this.filterOptions.category = this.filterSelect;
            this.filterOptions.minimumAmount = this.minimumAmountSelect;
            this.filterOptions.maximumAmount = this.maximumAmountSelect;
            this.filterOptions.month = this.selectedMonth;
        },
        resetFilter() {
            this.filterOptions.category = "all";
            this.filterOptions.month = "";

            this.filterOptions.minimumAmount = 0;
            this.setMaxAmount();
            this.filterOptions.maximumAmount = parseInt(this.maxAmountForSliders);

            this.filterSelect = "all";
            this.selectedMonth = "";
            this.filterExpenses();
        }
    }
}).mount('#app')
