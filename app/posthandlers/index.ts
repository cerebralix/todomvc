import { mergeMap } from 'rxjs/operators';
import { createStore  } from 'redux';
import rootReducer from '../reducers/index';
import { get$, put$ } from '../store/server-db';
import {
	editTodo,
	addTodo,
	completeTodo,
	deleteTodo,
	completeAll,
	clearCompleted
} from '../actions/index';
import { Observable } from 'rxjs';

export function create(req, res): void {
	get$().pipe(
		mergeMap((doc: any): Observable<any> => {
			let filter = req.param.query && req.param.query || 'show_all',
				store = createStore(
					rootReducer,
					{
						filter,
						todos: doc.todos
					}
				);

			store.dispatch(addTodo(req.body.title));

			return put$(store.getState().todos, doc);
		})
	).subscribe(
		(): void => {
			if (req.path.includes('api')) {
				res.send('success');
			} else if (req.query.filter) {
				res.redirect('/' + req.query.filter);
			} else {
				res.redirect('/');
			}
		},
		(err: any): void => console.log(err)
	);
}
export function update(req, res): void {
	get$().pipe(
		mergeMap((doc: any): Observable<any> => {

			let todoId = parseInt(req.params.id, 10),
				todoTitle = req.body.title,
				store = createStore(
					rootReducer,
					{
						todos: doc.todos
					})
				;

			if (req.query.type === 'EDIT_TODO') {
				store.dispatch(editTodo(todoId, todoTitle));
			} else if (req.query.type === 'COMPLETE_TODO'){
				store.dispatch(completeTodo(todoId));
			} else {
				store.dispatch(deleteTodo(todoId));
			}

			return put$(store.getState().todos, doc);
		})
	).subscribe(
		(): void => res.send('success'),
		(err: any): void => console.log(err)
	);
}
export function massUpdate(req, res): void {
	get$().pipe(
		mergeMap((doc: any): Observable<any> => {

			let store = createStore(
				rootReducer,
				{
					todos: doc.todos
				})
			;

			if (req.query.type === 'COMPLETE_ALL') {
				store.dispatch(completeAll());
			} else {
				store.dispatch(clearCompleted());
			}

			return put$(store.getState().todos, doc);
		})
	).subscribe(
		(): void => res.send('success'),
		(err: any): void => console.log(err)
	);
}