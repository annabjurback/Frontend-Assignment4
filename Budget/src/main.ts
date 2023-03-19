import { createApp } from 'vue';
// import App from './App.vue'


// import './assets/main.css'

interface Expense {
    expense: string;
    amount: number;
    category: string;
    date: string;
    edit: boolean;
};
interface SumPerCategory {
    [key: string]: number;
};

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
            newItem: {
                expense: "" as string,
                amount: 0 as number,
                category: "" as string,
                date: new Date().toISOString().substring(0, 10) as string,
                edit: false as boolean
            } as Expense,
            // expense: "" as string,
            // amount: "",
            // category: "" as string,
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
            ] as Expense[],
            filterOptions: {
                category: "all",
                month: "",
                minimumAmount: 0,
                maximumAmount: 0
            } as { category: string, month: string, minimumAmount: number, maximumAmount: number },
            filterSelect: "all" as string,
            selectedMonth: "" as string,
            minimumAmountSelect: 0 as number,
            // Anna ändrat från 0 för att inte behöva klicka en massa:
            maximumAmountSelect: 5000 as number,
            maxAmountForSliders: 5000 as number,
            // tillagd av Anna, osäker på om det kommer behövas
            totalSumPerCategory: {
                household: 0,
                travel: 0,
                food: 0,
                entertainment: 0,
                clothing: 0,
                miscellaneous: 0
            } as SumPerCategory,
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
            this.drawSVG();
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
        // Capitalize first letter of a string
        capitalize(string: string): string {
            return string[0].toUpperCase() + string.slice(1);
        },
        drawSVG() {
            let w: number = 600;
            let h: number = 400;
            let r: number = h / 4;
            const svg: HTMLElement = this.createSVG(w, h);

            const background: HTMLElement = this.createSvgRect(0, 0, w, h);
            background.style.fill = '#cccccc';
            svg.append(background);

            // Parameters for drawing a pie chart. It's a lot, but I think it all needs to be here, since we use a for-loop to append many svg paths to our svg element..? Or could we create a function that returns a list of svg element an then append them one by one
            // FIXA ATT INGEN PATH OCH LEGEND-ENTRY SKA RITAS UT OM JUST DEN SPECIFIKA KATEGORIN HAR SUMMA NOLL
            const colors: string[] = ['tomato', '#FCA753', '#fff567','mediumseagreen',  'dodgerblue', 'mediumorchid'];
            const xc: number = w / 2.5;
            const yc: number = h / 2;
            
            let sum: number = 0;
            for (let sumCat in this.totalSumPerCategory)
            {
                sum += this.totalSumPerCategory[sumCat];
            };
            let x0: number = xc + r;
            let y0: number = yc;
            let amountPercentage: number = 0;
            let angle: number = 0;
            let totalAngle: number = 0;
            let x1: number = 0;
            let y1: number = 0;
            // Arc flag: 0/1 for small/large arc, 0 if angle > pi, otherwise 1
            let arcFlag = 0;
            let theCategories = Object.keys(this.totalSumPerCategory);
            for (let i = 0; i < theCategories.length; i++) {
                amountPercentage = this.totalSumPerCategory[theCategories[i]]/sum;
                angle = amountPercentage * 360 * (Math.PI / 180);
                arcFlag = angle > Math.PI? 1 : 0;
                totalAngle += angle;
                x1 = xc + r * Math.cos((totalAngle));
                y1 = h - (yc + r * Math.sin((totalAngle)));
                let path: HTMLElement = this.createSvgPath(r, x0, y0, x1, y1, xc, yc, arcFlag, colors[i]);
                svg.append(path);
                x0 = x1;
                y0 = y1;
            };

            // Parameters for drawing a legend.
            let xStart: number = w*0.7;
            let yStart: number = h*0.1;
            let boxSize: number = 10;
            let boxSpace: number = h*0.045;
            let legendBackground: HTMLElement = this.createSvgRect(xStart-5, yStart-5, 150, (boxSpace*5 + boxSize + 10));
            legendBackground.style.fill = 'white';
            svg.append(legendBackground);
            for (let i = 0; i < theCategories.length; i++) {
                let legendColorBox: HTMLElement = this.createSvgRect(xStart, yStart, boxSize, boxSize);
                legendColorBox.style.fill = colors[i];
                svg.append(legendColorBox);
                let legendEntry: HTMLElement = this.createSvgText(xStart + boxSize + 5, yStart + boxSize, this.capitalize(theCategories[i]));
                svg.append(legendEntry);
                yStart += boxSpace;
            };
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
        createSvgText(x:number, y: number, text: string) {
            const entry = this.createSvgElement('text');
            entry.setAttribute('x', x);
            entry.setAttribute('y', y);
            // kan göras i CSS istället:
            entry.setAttribute('fill', '#2f3035');
            entry.textContent = text;
            return entry;
        },
        // A list of the sum of each category is needed here, want to call it inside filterExpenses()? (JAKOB HJÄLP)
        calcTotalSumPerCategory(exp: Expense[])  {
            // first make a copy, to avoid weird updates(not sure if needed) ? (funkar ändå inte)
            // let result = Object.assign({}, this.totalSumPerCategory);
            exp.forEach((exp) => {
                this.totalSumPerCategory[exp.category] += exp.amount;
            });
            // this.totalSumPerCategory = Object.assign({}, result);
        }
    },
    computed: {
        // Lade till brackets i returtypen. För visst är det en lista av expenses vi skickar tillbaka?
        filterExpenses(): Expense[] {
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

            // // om nedan funktion INTE är bortkommenterad så hamnar vi i filterExpenses när vi ändrar en siffra i edit. Det går inte att edita amount och category när den är kvar. 
            // // Om den ÄR bortkommenterad hamnar den inte i filterExpenses, men då funkar inte cirkeldiagrammet.... VARFÖR????? 
            // JAKOB HJÄLP
            // let deepCopy: Expense[] = [];
            // for (let d of dummy)
            // {
                //     deepCopy[d.category] = d.expense;
                // };
            // // If all categories selected, calculate sum per category for pie chart
            if (this.filterOptions.category === "all") {
                this.calcTotalSumPerCategory(dummy);
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
