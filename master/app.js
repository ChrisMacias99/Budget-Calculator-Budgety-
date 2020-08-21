//module to handle budget calculations.
var BudgetController= (function(){
    //constructor for the expense objects
    var Expense= function(id, description, value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    Expense.prototype.calcPercentage= function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }
        else{
            this.percentage=-1;
        }
        
    };

    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }

    //constructor for the income objects
    var Income=function(id, description, value){

        this.id=id;
        this.description=description
        this.value=value;

    };

    var calculateTotal= function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        });
        data.totals[type]=sum;

    }

    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1

    };

    return{
        addItem:function(type,des,val){
            var newItem, ID;

            //set ID= lastID+1
            //create new ID
            if(data.allItems[type].length>0){
                ID= data.allItems[type][data.allItems[type].length-1].id+1;

            }
            else{
                ID=0;
            }
           

            //create new item based on the type of object
            if(type==='exp'){
                newItem= new Expense(ID,des,val);

            }
            else if(type==='inc'){
                newItem=new Income(ID,des,val);
            }

            //push to data structure

            data.allItems[type].push(newItem);

            //return new element
            return newItem;

            

        },

        deleteItem: function(type,id){
            var ids, index;

            ids= data.allItems[type].map(function(current){
                return current.id;
            });

            index= ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);

            }



        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calulate overall budget: income- expenses

            data.budget=data.totals.inc-data.totals.exp;

            //calculate percentage of income used
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);

            }
            else{
                data.percentage=-1;
            }
            

        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPerc= data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;

        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }

        },

        testing: function(){
            console.log(data);
        } 
    };

})();



//module to control UI updates and interaction
var UIcontroller=(function(){

    var DomStrings={
        inputType:'.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel:'.item__percentage',
        dateLabel: '.budget__title--month'

    };

    //function to change the form of a given number and create uniformity in the UI
    var formatNumber=function(num,type){
         var numSplit, int, dec, type, sign;
        /*
        + or - before number
        2 decimal formatting
        comma separating 1000 incriments
        */
        num=Math.abs(num);
        num=num.toFixed(2);
        numSplit=num.split('.');
        int =numSplit[0];
            
        if(int.length>3){
            int=int.substr(0,int.length-3)+ ','+int.substr(int.length-3,int.length);
        }
        dec=numSplit[1];

            

        return (type ==='exp'? sign='-':sign='+')+' '+int+'.'+dec;

    };

    var nodeListForEach= function(list,callback){
        for (var i=0; i<list.length; i++){
            callback(list[i],i);
        }
    };

    return {
        getinput: function(){
            return{
                type: document.querySelector(DomStrings.inputType).value, //this will collect the type of data to be either the income or the expenses
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
             };
            
        },

        addListItem: function(obj,type){
            var html, newHtml, element;
            //create HTML string with placeholder text
            //this looks super unprofessional. I will attempt to clean this up later
            //specify HTML string based on the type of the element
            if(type==='inc'){
                element=DomStrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            else if(type==='exp'){
                element=DomStrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            //Replace the placeholder with item data

            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

            //insert HTML into DOM 
            document.querySelector(element).insertAdjacentHTML('beforeEnd',newHtml);

        },

        deleteListItem: function(selectorID){
            //gathers the desired field in the html and removes it from the container
            var el;
            el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            //clears the input fields to allow for additional user input
            var fields, fieldsArr;
            fields=document.querySelectorAll(DomStrings.inputDescription + ', '+ DomStrings.inputValue);

            fieldsArr=Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value="";
            });

            fieldsArr[0].focus();


        },

        displayBudget: function(obj){
            //gathers total calculated budget and displays it in the appropriate UI element location
            var type;
            obj.budget>0? type='inc':type='exp';

            document.querySelector(DomStrings.budgetLabel).textContent='$'+formatNumber(obj.budget,type);
            document.querySelector(DomStrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DomStrings.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0){
                document.querySelector(DomStrings.percentageLabel).textContent=obj.percentage+'%';

            }
            else{
                document.querySelector(DomStrings.percentageLabel).textContent='---';
            }
        },

        displayPercentages: function(percentages){
            var fields= document.querySelectorAll(DomStrings.expensesPercLabel);
            

            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+'%';
                }
                else{
                    current.textContent= '---';
                }
                
            });
        },

        displayMonth: function(){
            var now, month,months, year;
            now= new Date();

            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();
            year=now.getFullYear();            

            document.querySelector(DomStrings.dateLabel).textContent=months[month]+', '+year;
        },

        //could not figure out why this would not work
        /*changedType: function(){
            var fields;

            fields=document.querySelectorAll(DomStrings.inputType,+','+DomStrings.inputDescription+','+DomStrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
        },*/

   

        getDomStrings: function(){
            return DomStrings;
        }
    };

})();

//module to handle all application interactions
var AppController= (function(BudgetCtrl,Uictrl){

    var SetEventListeners= function(){

        var Dom=Uictrl.getDomStrings();

        document.querySelector(Dom.inputButton).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
            if(event.keyCode===13 || event.which ===13 ){
                ctrlAddItem();
            }
        });

        document.querySelector(Dom.container).addEventListener('click',ctrlDeleteItem);

        //document.querySelector(Dom.inputType).addEventListener('change',Uictrl.changedType());
    }

    var updateBudget= function(){
        //1. calculate the budget
        BudgetCtrl.calculateBudget();

        //2. return the budget
        var budget= BudgetCtrl.getBudget();


        //3. Display updated budget to UI
        Uictrl.displayBudget(budget);

    }

    var updatePercentages = function(){
        //1. Calculate the current percentages
        BudgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages=BudgetCtrl.getPercentages();
        //3. Update UI with new percentage entries
        Uictrl.displayPercentages(percentages);
    };
    
    
    //adds item to the list container on the UI
    var ctrlAddItem=function(){
        var input, newItem;
        //1. get the input field data
        input= Uictrl.getinput();
        console.log(input);
        console.log("data gathered");

        //condition to check if the value is valid
        if(input.description !=="" && !isNaN(input.value) && input.value >0){
            //2. Add item to budget controller
            newItem= BudgetCtrl.addItem(input.type,input.description,input.value);

            //3. Add item to the UI
            Uictrl.addListItem(newItem,input.type);

            //4. Clear input fields
            Uictrl.clearFields();

            //5. Calculate and update the budget
            updateBudget();

            //6.calculate new percentages and update
            updatePercentages();
        }
    }

    var ctrlDeleteItem=function(event){
        var itemID, splitID, type, ID;
        itemID= event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            //gather item type and id for process of deletion
            splitID=itemID.split('-');
            type=splitID[0];
            ID=parseInt(splitID[1]);

            //remove item from the array
            BudgetCtrl.deleteItem(type,ID);

            //remove item entry from the UI listing
            Uictrl.deleteListItem(itemID);

            //calculate new budget and update it
            updateBudget();

            //calculate new percentages and update it
            updatePercentages();

        }
    }



    return{
        init: function(){
            console.log("Initializing applications event listeners");
            Uictrl.displayMonth();
            Uictrl.displayBudget({budget:0,totalInc:0,totalExp:0,percentage:-1});
            SetEventListeners();

        }
    };
    
    
   

   



})(BudgetController,UIcontroller);

//begin program
AppController.init();