let STORAGE_KEY = 'TDTracker';
let todoStorage = {
	get: function () {
		let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		todos.forEach(function (todo, index) {
			todo.id = index;
		})
		todoStorage.uid = todos.length;
		return todos;
	},
	set: function (todos) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
	}
}

let filters = {
	all: function (todos) {
		return todos;
	},
	active: function (todos) {
		return todos.filter(function (todo) {
			return !todo.complete;
		})
	},
	completed: function (todos) {
		return todos.filter(function (todos) {
			return todos.complete;
		})
	}
}

var app = new Vue({
	el: "#todo-app",
	data: {
		todos: todoStorage.get(),
		newTodo: '',
		visibility: 'all',
		editedTodo: null
	},
	watch: {
		todos: {
			handler: function (todos) {
				todoStorage.set(todos)
			},
			deep: true
		}
	},
	computed: {
		showDeleteCompletedButton: function () {
			return this.todos.length > this.remaining && this.visibility == 'completed';
		},
		filteredTodos: function () {
			return filters[this.visibility](this.todos)
		},
		remaining: function () {
			return filters.active(this.todos).length;
		},
		allDone: {
			get: function () {
				return this.remaining === 0;
			},
			set: function (value) {
				this.todos.forEach(function (todo) {
					todo.complete = value;
				})
			}
		}
	},
	methods: {
		addTodo: function () {
			let value = this.newTodo && this.newTodo.trim();
			if (!value) {
				return
			}
			this.todos.push({
				id: todoStorage.uid++,
				title: value,
				complete: false
			})
			this.newTodo = '';
		},
		removeTodo: function (todo) {
			this.todos.splice(this.todos.indexOf(todo), 1)
		},
		editTodo: function (todo) {
			this.beforeChange = todo.title;
			this.editedTodo = todo;
		},
		doneEdit: function (todo) {
			if (!this.editedTodo) {
				return
			}
			this.editedTodo = null;
			todo.title = todo.title.trim();
			if (!todo.title) {
				this.removeTodo(todo)
			}
		},
		cancelEdit: function (todo) {
			this.editedTodo = null;
			todo.title = this.beforeChange;
		},
		removeCompleted: function () {
			this.todos = filters.active(this.todos);
		}
	},
	directives: {
		'todo-focus': function (el, binding) {
			if (binding.value) {
				el.focus()
			}
		}
	}
})

function onHashChange() {
	var visibility = window.location.hash.replace(/#\/?/, '')
	if (filters[visibility]) {
		app.visibility = visibility
	} else {
		window.location.hash = ''
		app.visibility = 'all'
	}
}

window.addEventListener('hashchange', onHashChange)
onHashChange()
