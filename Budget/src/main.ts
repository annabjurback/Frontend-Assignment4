import { createApp } from 'vue';
// import App from './App.vue'


// import './assets/main.css'

interface Expense {
    expense: string;
    amount: number;
    category: string;
    date: string;
    edit: boolean;
    id: number;
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
                expense: "",
                amount: 0,
                category: "",
                date: new Date().toISOString().substring(0, 10),
                edit: false,
                id: 0
            } as Expense,
            expenses: [
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
            maximumAmountSelect: 0 as number,
            maxAmountForSliders: 0 as number,
            totalSumPerCategory: {
                'household': 0,
                'travel': 0,
                'food': 0,
                'entertainment': 0,
                'clothing': 0,
                'miscellaneous': 0
            } as SumPerCategory,
        }
    },
    methods: {
        addExpense(): void {
            if (this.expenses.length === 0) {
                this.newItem.id = 1;
            }
            else {
                let lastItemID = this.expenses.at(-1).id;
                this.newItem.id = ++lastItemID;
            }
            // make deep copy of newItem, push to expenses
            this.expenses.push(JSON.parse(JSON.stringify(this.newItem)));
            this.setMaxAmount;

            this.resetFilter();
            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            // Reset input fields
            this.newItem.expense = '';
            this.newItem.amount = 0;
            this.newItem.category = "";
            this.newItem.date = new Date().toISOString().substring(0, 10);

            this.drawSVG();
        },
        deleteExpense(index: number): void {
            this.expenses.splice(index, 1);
            this.setMaximumSliderValue();

            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));

            this.drawSVG();
        },
        editExpense(index: number, id: number): void {
            let expenseToEdit = this.expenses.find((expense: any) => expense.id === id);

            expenseToEdit.edit = !expenseToEdit.edit;
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            //nya
            this.setMaximumSliderValue();
            this.setMinimumSliderValue();

            if (!expenseToEdit.edit) {
                this.resetFilter();
            }

            this.drawSVG();
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
        // Capitalize first letter of a string
        capitalize(string: string): string {
            if (string !== '') {
                return string[0].toUpperCase() + string.slice(1);
            }
            else {
                return '';
            }
        },
        drawSVG() {
            this.clearTotalSumPerCategory();
            this.calcTotalSumPerCategory();
            // let graphBox: HTMLElement | null = this.$refs.graphBox;
            // let graphW = 0;
            // let graphH = 0;
            // if (graphBox !== null) {
            //     graphW = graphBox.offsetWidth;
            //     graphH = graphBox.offsetHeight;
            // };
            // let w: number = graphW;
            // let h: number = graphH;
            let w: number = 280;
            let h: number = w * (2 / 3);
            const svg: HTMLElement = this.createSVG(w, h);

            const background: HTMLElement = this.createSvgRect(0, 0, w, h);
            background.style.fill = '#cccccc';
            svg.append(background);

            // Starting parameters for drawing a pie chart. 
            // Skulle vilja knyta en färg till en viss kategori, men det får bli om det finns tid :)
            const colors: string[] = ['tomato', '#FCA753', '#fff567', 'mediumseagreen', 'dodgerblue', 'mediumorchid'];
            // radius and center coordinates for path
            const r: number = h / 4;
            const xc: number = w * (1 / 3);
            const yc: number = h * (4 / 7);

            let totalSum: number = 0;
            for (let category in this.totalSumPerCategory) {
                totalSum += this.totalSumPerCategory[category];
            };
            let nonZeroCategories = Object.keys(this.totalSumPerCategory).filter(key => this.totalSumPerCategory[key] !== 0);

            let x0: number = xc + r;
            let y0: number = yc;
            let percentageOfFullPath: number = 0;
            // angle is used to calculate the percentage of full path for each path element
            let angle: number = 0;
            // totalAngle is used to calculate the end point for each path
            let totalAngle: number = 0;
            let x1: number = 0;
            let y1: number = 0;
            // Arc flag: 0/1 for small/large arc, 0 if angle < pi, otherwise 1. 
            let arcFlag = 0;

            // Don't draw anything if no categories in filter
            if (nonZeroCategories.length !== 0) {
                // Starting parameters for drawing a legend.
                let legendXStart: number = w * 0.65;
                let legendYStart: number = yc - r - h * 0.065;
                let boxSize: number = h * 0.04; // ÄNDRA HÄR!!!!
                let boxSpace: number = h * 0.06;
                // Legend background starts 5px before the color boxes (in x- & y-direction) and ends 5p after color boxes (in y-direction):
                let legendBackground: HTMLElement = this.createSvgRect(legendXStart - 5, legendYStart - 5, w / 3, (boxSpace * (nonZeroCategories.length - 1) + boxSize + 10));
                legendBackground.style.fill = 'white';
                svg.append(legendBackground);
                // Draw paths (or circle if only one category):
                for (let i = 0; i < nonZeroCategories.length; i++) {
                    percentageOfFullPath = this.totalSumPerCategory[nonZeroCategories[i]] / totalSum;
                    if (percentageOfFullPath > 0) {
                        // pie piece
                        angle = percentageOfFullPath * 360 * (Math.PI / 180);
                        arcFlag = angle > Math.PI ? 1 : 0;
                        totalAngle += angle;
                        x1 = xc + r * Math.cos((totalAngle));
                        y1 = yc - r * Math.sin((totalAngle));
                        let path: HTMLElement = this.createSvgPath(r, x0, y0, x1, y1, xc, yc, arcFlag, colors[i]);
                        svg.append(path);
                        // update starting position for next pie piece
                        x0 = x1;
                        y0 = y1;

                        // legend color box
                        let legendColorBox: HTMLElement = this.createSvgRect(legendXStart, legendYStart, boxSize, boxSize);
                        legendColorBox.style.fill = colors[i];
                        svg.append(legendColorBox);

                        // legend text
                        let legendEntry: HTMLElement = this.createSvgText(legendXStart + boxSize + 5, legendYStart + boxSize, this.capitalize(nonZeroCategories[i]));
                        svg.append(legendEntry);
                        // update starting position for next legend entry
                        legendYStart += boxSpace;
                    }

                    // draw a circle if only one category exists in the filter:
                    // (path will not work with only one category since angle would be 360 = 0, meaning NO path)
                    // (we have already drawn the legend element)
                    if (percentageOfFullPath === 1) {
                        let circle = this.createSvgCircle(xc, yc, r);
                        svg.append(circle);
                    }
                }
                // Build a title string and append to svg graph
                let titleText: string = "Expenses "
                // let timeText: string = 'Expenses';
                let selectedMonth: string = this.filterOptions.month;
                if (selectedMonth !== '') {
                    let month: number = parseInt(selectedMonth.substring(5));
                    let monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    titleText += ' for ' + monthNames[month - 1];
                };

                if (this.filterOptions.minimumAmount == 0 &&
                    this.filterOptions.maximumAmount != this.maxAmountForSliders &&
                    this.filterOptions.maximumAmount != 0) {
                    titleText += ' up to ' + this.filterOptions.maximumAmount + ' kr';
                } else if (this.filterOptions.maximumAmount == this.maxAmountForSliders &&
                    this.filterOptions.minimumAmount != 0) {
                    titleText += ' above ' + this.filterOptions.minimumAmount + ' kr';
                } else if (this.filterOptions.minimumAmount != 0 &&
                    this.filterOptions.minimumAmount != this.maxAmountForSliders &&
                    this.filterOptions.maximumAmount != 0 &&
                    this.filterOptions.maximumAmount != this.maxAmountForSliders) {
                    titleText += ' between ' + this.filterOptions.minimumAmount + ' and '+ 
                    this.filterOptions.minimumAmount +' kr';
                };

                let graphTitle: HTMLElement = this.createSvgText('50%', h * 0.1, titleText);
                graphTitle.setAttribute('dominant-baseline', 'middle');
                graphTitle.setAttribute('text-anchor', 'middle');
                svg.append(graphTitle);

                let sumText: HTMLElement = this.createSvgText(w*0.7, h*0.95, "Sum of illustrated expenses: " + totalSum + ' kr');
                sumText.setAttribute('class', 'small');
                svg.append(sumText);
            }
        },
        createSVG(w: number, h: number) {
            const svg = this.createSvgElement('svg');
            svg.setAttribute('width', w);
            svg.setAttribute('height', h);
            let graphBox: HTMLElement | null = this.$refs.graphBox;

            // WE know that graphBox is not null, but TS doesn't (not the best-looking solution?)..
            if (graphBox !== null) {
                // first clear all the "old" elements..
                while (graphBox.firstElementChild) {
                    graphBox.firstElementChild.remove();
                }
                // .. then append the new one
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
        createSvgPath(r: number, x0: number, y0: number, x1: number, y1: number, xc: number, yc: number, arcFlag: number, color: string) {
            const path = this.createSvgElement('path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            // kanske ha variabel stroke-width beroende på w eller h?
            path.setAttribute('stroke-width', '15%');
            let buildPath = 'M ' + x0 + ',' + y0 +
                ' A ' + r + ' ' + r + ' 0 ' + arcFlag + ' 0 ' + x1 + ',' + y1;
            path.setAttribute('d', buildPath);
            path.setAttribute('transform', 'rotate(-90, ' + xc + ',' + yc + ')');
            return path;
        },
        createSvgCircle(xc: number, yc: number, r: number) {
            const circle = this.createSvgElement('circle');
            circle.setAttribute('cx', xc);
            circle.setAttribute('cy', yc);
            circle.setAttribute('r', r);
            circle.setAttribute('stroke', 'tomato');
            circle.setAttribute('stroke-width', '15%');
            circle.setAttribute('fill', 'transparent');
            return circle;

        },
        createSvgText(x: number | string, y: number, text: string) {
            const entry = this.createSvgElement('text');
            entry.setAttribute('x', x);
            entry.setAttribute('y', y);
            entry.textContent = text;
            return entry;
        },
        calcTotalSumPerCategory() {
            for (let d of this.filterExpenses) {
                this.totalSumPerCategory[d.category] += d.amount;
            };
        },
        clearTotalSumPerCategory() {
            this.totalSumPerCategory.household = 0;
            this.totalSumPerCategory.travel = 0;
            this.totalSumPerCategory.food = 0;
            this.totalSumPerCategory.entertainment = 0;
            this.totalSumPerCategory.clothing = 0;
            this.totalSumPerCategory.miscellaneous = 0;
        }
    },
    // kör en gång när programmet startas:
    mounted() {

        if (window.localStorage.getItem('expenses') !== null) {
            this.expenses = window.localStorage.getItem('expenses');
            this.expenses = JSON.parse(this.expenses);
        }
        else {
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            this.expenses = window.localStorage.getItem('expenses');
            this.expenses = JSON.parse(this.expenses);
        }

        this.applyFilter();
        this.calcTotalSumPerCategory();
        this.drawSVG();
    },
    computed: {
        filterExpenses(): Expense[] {
            // this.setMaximumSliderValue();

            let dummy;
            if (this.filterOptions.category === "all") {
                dummy = this.expenses.slice();
            }
            else {
                dummy = this.expenses.filter((ex: { category: string; }) => ex.category === this.filterOptions.category);
            }

            //Only apply cost filter if a maximum cost is selected (i.e it is not at 0)
            if (this.filterOptions.maximumAmount !== 0) {
                dummy = dummy.filter((ex: { edit: boolean, amount: number }) => ex.amount >= this.filterOptions.minimumAmount && ex.amount <= this.filterOptions.maximumAmount || ex.edit === true);
            }

            //If month is not an empty string. Apply month filter.
            if (this.filterOptions.month !== "") {
                dummy = dummy.filter((ex: { date: string }) => ex.date.includes(this.filterOptions.month));
            }

            return dummy;
        },
        // Sets the highest entered amount for an expense (used for cost filter sliders)
        setMaxAmount(): void {
            // ChatGPT helped with this one:
            this.maxAmountForSliders = this.expenses.reduce((max: number, currentExpense: any) => {
                return currentExpense.amount > max ? currentExpense.amount : max;
            }, 0);
        },
    }
}).mount('#app')
