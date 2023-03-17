import { createApp } from 'vue';
// import App from './App.vue'


// import './assets/main.css'

interface Expense {
    expense: string;
    amount: number;
    category: string;
    date: string;
    edit: boolean;
}

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
            // expense: "" as string,
            // amount: "",
            // category: "" as string,
            newItem: {
                expense: "" as string,
                amount: 0 as number,
                category: "" as string,
                date: new Date().toISOString().substring(0, 10) as string,
                edit: false as boolean
            } as Expense,
            //date: new Date().toISOString().substring(0, 10) as string,
            expenses: [
                //     {
                //         expense: "Cat",
                //         amount: 10,
                //         category: "household",
                //         date: new Date().toISOString().substring(0, 10),
                //         edit: false
                //     },
                //     {
                //         expense: "Dog",
                //         amount: 123,
                //         category: "entertainment",
                //         date: new Date().toISOString().substring(0, 10),
                //         edit: false
                //     },
                //     {
                //         expense: "Dog2",
                //         amount: 124,
                //         category: "entertainment",
                //         date: new Date().toISOString().substring(0, 10),
                //         edit: false
                // } as { expense: string, amount: number, category: string, edit: boolean, date: string }
            ],
            // tillagd av Anna, osäker på om det kommer behövas
            expensesForSvg: {
                household: 0 as number,
                travel: 0 as number,
                food: 0 as number,
                entertainment: 0 as number,
                clothing: 0 as number,
                miscellaneous: 0 as number
            },
            filterOptions: {
                category: "all",
                month: "",
                minimumAmount: 0,
                maximumAmount: 0
            } as { category: string, month: string, minimumAmount: number, maximumAmount: number },
            filterSelect: "all" as string,
            selectedMonth: "" as string,
            minimumAmountSelect: 0 as number,
            // Anna ändrat för att inte behöva klicka en massa:
            maximumAmountSelect: 5000 as number,
            maxAmountForSliders: 5000 as number,
        }
    },
    methods: {
        addExpense(): void {

            this.expenses.push(this.newItem);
            this.setMaxAmount;

            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
        },
        deleteExpense(index: number): void {
            this.expenses.splice(index, 1);
            this.setMaximumSliderValue();

            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
        },
        editExpense(index: number): void {
            this.expenses[index].edit = !this.expenses[index].edit;

            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            //nya
            this.setMaximumSliderValue();
            this.setMinimumSliderValue();

        },
        getExpensesFromStorage(): void {
            // Get expenses from local storage
            if (window.localStorage.getItem('expenses') !== null) {
                this.expenses = window.localStorage.getItem('expenses');
                this.expenses = JSON.parse(this.expenses);
            }
            else {
                window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
                this.expenses = window.localStorage.getItem('expenses');
                this.expenses = JSON.parse(this.expenses);
            }
        },
        // The two methods below keep track of the selected values in the minimum and maximum amount sliders, so that the selected minimum amount cannot exeed selected maximum amount, and vice versa
        setMinimumSliderValue(): void {
            if (parseInt(this.maximumAmountSelect) < parseInt(this.minimumAmountSelect)) {
                this.minimumAmountSelect = this.maximumAmountSelect;
            }
        },
        setMaximumSliderValue(): void {
            this.setMaxAmount;
            // If zero is selected, assume the full range
            if (this.maximumAmountSelect === 0) {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
            // If selected minimum amount is larger than selected maximum amount, set max to min value 
            if (parseInt(this.minimumAmountSelect) > parseInt(this.maximumAmountSelect)) {
                this.maximumAmountSelect = this.minimumAmountSelect;
            }
            // If current maximum expense is less than selected max, set selected max to current maximum expense 
            if (parseInt(this.maxAmountForSliders) < parseInt(this.maximumAmountSelect)) {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
        },
        applyFilter(): void {
            this.filterOptions.category = this.filterSelect;
            this.filterOptions.minimumAmount = this.minimumAmountSelect;
            this.filterOptions.maximumAmount = this.maximumAmountSelect;
            this.filterOptions.month = this.selectedMonth;
        },
        resetFilter(): void {
            this.filterOptions.category = "all";
            this.filterOptions.minimumAmount = 0;
            this.filterOptions.maximumAmount = this.maxAmountForSliders;
            this.filterOptions.month = "";

            this.filterSelect = "all";
            this.minimumAmountSelect = 0;
            this.maximumAmountSelect = this.maxAmountForSliders;
            this.selectedMonth = "";
            this.filterExpenses;
        },
        // Function to capitalize first letter of a string
        capitalize(string: string): string {
            return string[0].toUpperCase() + string.slice(1);
        },
        drawSVG() {
            let w = 600;
            let h = 400;
            let r = h / 4;
            const svg = this.createSVG(w, h);

            const background = this.createSvgRect(0, 0, w, h);
            background.style.fill = '#cacaca';
            svg.append(background);

            // const pie = this.createSvgCircle(w/2, h/2, r);
            // pie.style.fill = 'blue';
            // svg.append(pie);

            const xc = w / 2;
            const yc = h / 2;
            let x0 = xc + r;
            let y0 = yc;
            let angle = 180 * (Math.PI / 180);
            let x1 = xc + r * Math.cos((angle));
            let y1 = h - (yc + r * Math.sin((angle)));
            // Arc flag: 0/1 small arc/large arc, 0 if angle > pi, otherwise 1
            let arcFlag = 0;

            this.calcTotalSumPerCategory();

            const firstPath = this.createSvgPath(r, x0, y0, x1, y1, xc, yc, arcFlag, 'black');
            svg.append(firstPath);

        },
        createSVG(w: number, h: number) {
            const svg = this.createSvgElement('svg');
            svg.setAttribute('width', w);
            svg.setAttribute('height', h);
            let graphBox: HTMLElement | null = document.getElementById('graph-box');
            // not the best-looking solution:
            // we know that graphBox is not null, but TS doesn't..
            if (graphBox !== null) {
                // first: clear all the "old" elements
                while (graphBox.firstElementChild) {
                    graphBox.firstElementChild.remove();
                }
                graphBox.append(svg);
            }
            return svg;
        },
        createSvgElement(tagType: string) {
            return document.createElementNS('http://www.w3.org/2000/svg', tagType);
        },
        createSvgRect(x: number, y: number, w: number, h: number) {
            const rectangle = this.createSvgElement('rect');
            rectangle.setAttribute('width', w);
            rectangle.setAttribute('height', h);
            rectangle.setAttribute('x', x);
            rectangle.setAttribute('y', y);
            return rectangle;
        },
        // createSvgCircle(cx: number, cy: number, r: number) {
        //     const circle = this.createSvgElement('circle');
        //     circle.setAttribute('cx', cx);
        //     circle.setAttribute('cy', cy);
        //     circle.setAttribute('r', r);
        //     return circle;
        // },
        createSvgPath(r: number, x0: number, y0: number, x1: number, y1: number, cx: number, yc: number, arcFlag: number, color: string) {
            const path = this.createSvgElement('path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', '15%');
            let buildPath = 'M ' + x0 + ',' + y0 +
                ' A ' + r + ' ' + r + ' 0 ' + arcFlag + ' 0 ' + x1 + ',' + y1;
            path.setAttribute('d', buildPath);
            path.setAttribute('transform', 'rotate(-90, ' + cx + ',' + yc + ')');
            return path;
        },
        // A list of the sum of each category is needed here
        calcTotalSumPerCategory() {
        }
    },
    computed: {
        filterExpenses(): Expense {
            // this.setMaximumSliderValue();
            this.getExpensesFromStorage();

            let dummy;
            if (this.filterOptions.category === "all") {
                dummy = this.expenses.slice();
            }
            else {
                dummy = this.expenses.filter((ex: { category: string; }) => ex.category === this.filterOptions.category);
            }

            //Only apply cost filter if a maximum cost is selected (i.e it is not at 0)
            if (this.filterOptions.maximumAmount !== 0) {
                dummy = dummy.filter((ex: { amount: number }) => ex.amount >= this.filterOptions.minimumAmount && ex.amount <= this.filterOptions.maximumAmount);
            }

            //If month is not an empty string. Apply month filter.
            if (this.filterOptions.month !== "") {
                dummy = dummy.filter((ex: { date: string }) => ex.date.includes(this.filterOptions.month));
            }
            return dummy;
        },
        // Sets the highest entered amount for an expense (used for cost filter sliders)
        setMaxAmount(): void {
            // ChatGPT helped with this one
            this.maxAmountForSliders = this.expenses.reduce((max: number, currentExpense: any) => {
                return currentExpense.amount > max ? currentExpense.amount : max;
            }, 0);
        }
    }
}).mount('#app')
