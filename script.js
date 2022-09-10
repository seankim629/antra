// * ~~~~~~~~~~~~~~~~~~~ Api ~~~~~~~~~~~~~~~~~~~
const Api = (() => {
	// const baseUrl = "https://jsonplaceholder.typicode.com";
  	const baseUrl = 'http://localhost:3000';
	const todopath = "todos";

	const getTodos = () =>
		fetch([baseUrl, todopath].join("/")).then((response) =>
			response.json()
		);

	const deleteTodo = (id) =>
		fetch([baseUrl, todopath, id].join("/"), {
			method: "DELETE",
		});
	
	const completeTodo = (id) =>
		fetch([baseUrl, todopath, id].join("/"), {
			method: "PATCH",
			body:JSON.stringify({
				completed:true,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		}).then((response) => response.json());

	const uncompleteTodo = (id) =>
		fetch([baseUrl, todopath, id].join("/"), {
			method: "PATCH",
			body:JSON.stringify({
				completed:false,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		}).then((response) => response.json());

	const addTodo = (todo) =>
		fetch([baseUrl, todopath].join("/"), {
			method: "POST",
			body: JSON.stringify(todo),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		}).then((response) => response.json());
	
	// const updateTodo = (todo, id) =>
    // 	fetch("https://jsonplaceholder.typicode.com/posts/1", {
    //   method: "PATCH",
    //   body: JSON.stringify(todo),
    //   headers: {
    //     "Content-type": "application/json; charset=UTF-8",
    //   },
    // }).then((response) => response.json());
	// const editTodo = (todo, id) =>
	// 	fetch()

	const editTodo = (value, id) => {
        fetch([baseUrl, todopath, id].join('/'),{
			method: "PATCH",
			body:JSON.stringify({title: value}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		}).then((response) => response.json());
    }

	return {
		getTodos,
		deleteTodo,
    addTodo,
	completeTodo,
	uncompleteTodo,
	editTodo,
	};
})();

// * ~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~
const View = (() => {
	const domstr = {
		todocontainer: "#todolist_container",
		inputbox: ".todolist__input",
		completecontainer: '#completelist_container'
	};

	const render = (ele, tmp) => {
		ele.innerHTML = tmp;
	};
	const createTmp = (arr) => {
		let tmp = "";
		arr.forEach((todo) => {
			tmp += `
        <li>
          <span>${todo.title}</span>
		  <input style = "display:none"/>
		  <button class="editbtn" id="${todo.id}">X</button>
		  <button class="deletebtn" id="${todo.id}">X</button>
		  <button class="completebtn" id="${todo.id}">X</button>
        </li>
      `;
		});
		return tmp;
	};

	const completeTmp = (arr) => {
		let tmp = "";
		arr.forEach((todo) => {
			tmp += `
        <li>
          <span>${todo.title}</span>
		  <input style = "display:none"/>
		  <button class="completebtn" id="${todo.id}">X</button>
		  <button class="editbtn" id="${todo.id}">X</button>
          <button class="deletebtn" id="${todo.id}">X</button>
		  
        </li>
      `;
		});
		return tmp;
	};

	return {
		render,
		createTmp,
		completeTmp,
		domstr,
	};
})();

// * ~~~~~~~~~~~~~~~~~~~ Model ~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
	const { getTodos, deleteTodo, addTodo, completeTodo,uncompleteTodo } = api;

	class Todo {
		constructor(title) {

			this.completed = false;
			this.title = title;
		}
	}

	class State {
		#todolist = [];
		#completelist = [];

		get todolist() {
			return this.#todolist;
		}
		set todolist(newtodolist) {
			this.#todolist = newtodolist;

			const todocontainer = document.querySelector(
				view.domstr.todocontainer
			);
			const tmp = view.createTmp(this.#todolist);
			view.render(todocontainer, tmp);
		}
		get completelist() {
			return this.#completelist;
		}
		set completelist(newcompletelist) {
			this.#completelist = newcompletelist;

			const completecontainer = document.querySelector(
				view.domstr.completecontainer
			);
			const tmp = view.completeTmp(this.#completelist);
			view.render(completecontainer, tmp);
		}
	}

	return {
		getTodos,
		deleteTodo,
    addTodo,
	completeTodo,
	uncompleteTodo,
		State,
		Todo,
	};
})(Api, View);

// * ~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
	const state = new model.State();

	const deleteTodo = () => {
		const todocontainer = document.querySelector(
			view.domstr.todocontainer
		);
		todocontainer.addEventListener("click", (event) => {
			if (event.target.className === "deletebtn") {
				state.todolist = state.todolist.filter(
					(todo) => +todo.id !== +event.target.id
				);
				model.deleteTodo(event.target.id);
			}
		});
	};

	const addTodo = () => {
		const inputbox = document.querySelector(view.domstr.inputbox);
		inputbox.addEventListener("keyup", (event) => {
			if (event.key === "Enter" && event.target.value.trim() !== '') {
				const todo = new model.Todo(event.target.value);
        model.addTodo(todo).then(todofromBE => {
          console.log(todofromBE);
          state.todolist = [todofromBE, ...state.todolist];
        });
        event.target.value = '';
			}
		});
	};

	const completeTodo = () => {
		const todocontainer = document.querySelector(
			view.domstr.todocontainer
		);
		todocontainer.addEventListener("click", (event) => {
			if (event.target.className === "completebtn") {
				state.todolist = state.todolist.filter(
					(todo) => +todo.id !== +event.target.id
				);
				model.completeTodo(event.target.id).then(todofromBE =>{
					state.completelist = [todofromBE, ...state.completelist];
				});
				
			}
		});
	};

	const uncompleteTodo = () => {
		const completecontainer = document.querySelector(
			view.domstr.completecontainer
		);
		completecontainer.addEventListener("click", (event) => {
			if (event.target.className === "completebtn") {
				state.completelist = state.completelist.filter(
					(todo) => +todo.id !== +event.target.id
				);
				model.uncompleteTodo(event.target.id).then(todofromBE => {
					state.todolist = [todofromBE, ...state.todolist];
				}
					
				);
				
			}
		});
	};

	const editcomplete = () => {
		const completecontainer = document.querySelector(
		  view.domstr.completecontainer
		);
		completecontainer.addEventListener("click", (event) => {
			if (event.target.className === 'editbtn') {
				const id = event.target.id
				let span = event.target.parentNode.firstChild.nextElementSibling
                span.innerHTML = `<input value="${span.innerHTML}" />`;
				span.addEventListener('keyup', (second) => {
				  if (second.key === "Enter" && second.target.value.trim() !== '') {
					span.innerHTML = `${second.target.value}`;
					model.editTodo(second.target.value,id).then(init);
				  }
				});
			}
		});	
	  };

	
	  const editincomplete = () => {
		const todocontainer = document.querySelector(
		  view.domstr.todocontainer
		);
		todocontainer.addEventListener("click", (event) => {
			if (event.target.className === 'editbtn') {
				const id = event.target.id
				let span = event.target.parentNode.firstChild.nextElementSibling
                span.innerHTML = `<input value="${span.innerHTML}" />`;
				span.addEventListener('keyup', (second) => {
					if (second.key === "Enter" && second.target.value.trim() !== '') {
					  span.innerHTML = `${second.target.value}`;
					  model.editTodo(second.target.value, id).then(init);
					}
				  });
			}
		});
	  };
	

	const init = () => {
		model.getTodos().then((todos) => {
			state.todolist = todos.reverse().filter(
				(todo) => todo.completed !== true
			);
			state.completelist = todos.reverse().filter(
				(todo) =>  todo.completed !== false
			);
		});
	};

	const bootstrap = () => {
		init();
		deleteTodo();
		addTodo();
		completeTodo();
		uncompleteTodo();
		editcomplete();
		editincomplete();
	};

	return { bootstrap };
})(Model, View);

Controller.bootstrap();
