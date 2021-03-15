import React from 'react';
import icons from './img/icons.svg';
import { Fraction } from 'fractional';
import { API_URL, RES_PER_PAGE } from './config.js';
import {
	getJSON,
	sendJSON,
	loadingSpinner,
	renderError,
	message,
} from './helpers.js';

//the object we create with Context will be an array of a state object and set state function.
export const GlobalState = React.createContext([{}, () => {}]);

// Get, Parse, & Display the Recipe ----------------------------------------------------------------------------
export class Recipe extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			id: false,
			title: false,
			publisher: false,
			sourceURL: false,
			image: false,
			servings: null,
			cookingTime: false,
			ingredients: [],
			ingredientsSave: [],
			error: '',
			bookmarks: [],
		};
	}

	// Get the recipe ----------------------------------------------------------------------------
	fetchRecipe = async (id) => {
		try {
			//prettier-ignore
			if (!id) return;
			this.setState({
				isFetching: true,
			});

			const data = await getJSON(`${API_URL}/${id}`);

			let { recipe } = data.data;

			this.setState({
				id: recipe.id,
				title: recipe.title,
				publisher: recipe.publisher,
				sourceURL: recipe.source_url,
				image: recipe.image_url,
				servings: recipe.servings,
				cookingTime: recipe.cooking_time,
				ingredients: recipe.ingredients,
				isFetching: false,
			});
		} catch (err) {
			this.setState({
				error: err,
				isFetching: false,
			});
		}
	};

	// Do first mount ----------------------------------------------------------------------------
	async componentDidMount() {
		this.fetchRecipe(this.props.recipeId);
	}

	// Load the recipe from API ----------------------------------------------------------------------------
	componentDidUpdate(prevProps) {
		if (prevProps.recipeId === this.props.recipeId) {
			return;
		}
		this.fetchRecipe(this.props.recipeId);
	}

	// Create the HTML for each ingredient ----------------------------------------------------------------------------
	parseIngredients = () => {
		const ingredients = this.state.ingredients.map((ing, i) => {
			let qty;
			ing.quantity ? (qty = new Fraction(ing.quantity).toString()) : (qty = '');

			return (
				<li key={'ingredient' + i} className="recipe__ingredient">
					<svg className="recipe__icon">
						<use href={icons + '#icon-check'}></use>
					</svg>
					<div className="recipe__quantity">{qty}</div>
					<div className="recipe__description">
						<span className="recipe__unit">{ing.unit + ' '}</span>
						{ing.description}
					</div>
				</li>
			);
		});
		return ingredients;
	};

	// Update servings sizes ----------------------------------------------------------------------------
	controlServings = (e) => {
		// Figure out what this recipes qties are for a single serving, for easy calculating more servings
		const servingFor1 = this.state.ingredients.map((res) => {
			return res.quantity / this.state.servings;
		});

		// If decrease servings button
		if (!e) {
			if (this.state.servings === 1) return;

			const decreaseIngredients = this.state.ingredients.map((res, i) => {
				//prettier-ignore
				// let newQty = ((Math.round(((res.quantity * this.state.servings - 1) / this.state.servings) / 0.125) * 0.125).toFixed(3));
				let newQty = res.quantity - servingFor1[i]

				res.quantity = newQty;
				return res;
			});

			this.setState({
				ingredients: decreaseIngredients,
				servings: this.state.servings - 1,
			});
		}

		// If increase servings button
		if (e) {
			const increaseIngredients = this.state.ingredients.map((res, i) => {
				//prettier-ignore
				// let newQty = ((Math.round(((res.quantity * this.state.servings + 1) / this.state.servings) / 0.125) * 0.125).toFixed(3));
				let newQty = res.quantity + servingFor1[i]

				res.quantity = newQty;
				return res;
			});

			this.setState({
				ingredients: increaseIngredients,
				servings: this.state.servings + 1,
			});
		}
	};

	render() {
		let bmIcon;
		// If loading, display spinner
		if (this.state.isFetching) {
			return loadingSpinner();
		}
		// If error, display
		if (this.state.error) {
			return renderError(
				`Could not find that recipe. Please try another! ${this.state.error}`
			);
		}
		// check if the recipe is bookmarked already or not
		if (this.props.bookmarks.includes(this.state.id)) {
			bmIcon = `#icon-bookmark-fill`;
		} else {
			bmIcon = `#icon-bookmark`;
		}

		// If done loading and everything is happy, display the recipe
		return (
			<React.Fragment>
				{/* -----------------------Show Recipie Image ---------------------- */}

				<figure className="recipe__fig">
					<img
						src={this.state.image}
						alt={this.state.title}
						className="recipe__img"
					/>
					<h1 className="recipe__title">
						<span>{this.state.title}</span>
					</h1>
				</figure>
				<div className="recipe__details">
					{/* -----------------------Cooking Time ---------------------- */}
					<div className="recipe__info">
						<svg className="recipe__info-icon">
							<use href={icons + '#icon-clock'}></use>
						</svg>
						<span className="recipe__info-data recipe__info-data--minutes">
							{this.state.cookingTime}
						</span>
						<span className="recipe__info-text">minutes</span>
					</div>
					{/* ----------------------- Servings---------------------- */}
					<div className="recipe__info">
						<svg className="recipe__info-icon">
							<use href={icons + '#icon-users'}></use>
						</svg>
						<span className="recipe__info-data recipe__info-data--people">
							{this.state.servings}
						</span>
						<span className="recipe__info-text">servings</span>

						{/* Servings increase/decrease buttons */}
						<div className="recipe__info-buttons">
							<button
								className="btn--tiny btn--increase-servings"
								onClick={() => this.controlServings(0)}
							>
								<svg>
									<use href={icons + '#icon-minus-circle'}></use>
								</svg>
							</button>
							<button
								className="btn--tiny btn--increase-servings"
								onClick={() => this.controlServings(1)}
							>
								<svg>
									<use href={icons + '#icon-plus-circle'}></use>
								</svg>
							</button>
						</div>
					</div>
					{/* ----------------------- User Generated ---------------------- */}
					<div className="recipe__user-generated"></div>
					{/* ----------------------- Bookmarks ----------------------- */}
					<button
						className="btn--round btn--bookmark"
						onClick={() => {
							this.props.showBookmarks(this.state.bookmarks); // pass nothing through, just a empty function.
							// move this states bookmarks and bookmark function over to the bookmark class
						}}
					>
						<svg className="">
							<use href={icons + bmIcon}></use>
						</svg>
					</button>
				</div>
				{/* ------------------------------ Ingredients ------------------------------ */}
				<div className="recipe__ingredients">
					<h2 className="heading--2">Recipe ingredients</h2>
					<ul className="recipe__ingredient-list">
						<this.parseIngredients />
					</ul>
				</div>
				{/* ------------------------------ Directions ------------------------------ */}
				<div className="recipe__directions">
					<h2 className="heading--2">How to cook it</h2>
					<p className="recipe__directions-text">
						This recipe was carefully designed and tested by
						<span className="recipe__publisher">{this.state.publisher}</span>.
						Please check out directions at their website.
					</p>
					<a
						className="btn--small recipe__btn"
						href={this.state.sourceURL}
						target="_blank"
						rel="noreferrer"
					>
						<span>Directions</span>
						<svg className="search__icon">
							<use href={icons + '#icon-arrow-right'}></use>
						</svg>
					</a>
				</div>
			</React.Fragment>
		);
	}
}

export class LoadSearchResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			query: null,
			results: [],
			error: null,
			resultsPerPage: RES_PER_PAGE,
			maxSearchPages: 1,
			searchPage: 1,
		};
	}

	// Search the API for results ----------------------------------------------------------------------------
	fetchSearch = async (query) => {
		this.setState({
			error: null,
			searchPage: 1,
		});

		try {
			if (!query.trim()) {
				throw new Error(`Please enter a search term`);
			}
			const data = await getJSON(`${API_URL}?search=${query}`);

			if (data.results === 0) {
				throw new Error(`Can't find search results`);
			}

			this.setState({
				results: data.data.recipes,
				isFetching: false,
				maxSearchPages: data.data.recipes.length / 10,
			});
		} catch (err) {
			this.setState({
				isFetching: false,
				error: err,
			});
		}
	};

	// Everytime theres an update to this class, check if its the same search or a new one ----------------------------------------------------------------------------
	componentDidUpdate(prevProps) {
		if (prevProps.query === this.props.query) {
			return;
		}
		this.fetchSearch(this.props.query);
	}

	// Parse the results into their HTML ----------------------------------------------------------------------------
	parseSearchResults = () => {
		const start = (this.state.searchPage - 1) * this.state.resultsPerPage;
		const end = this.state.searchPage * this.state.resultsPerPage;

		const searchResults = this.state.results.map((res, i) => {
			return (
				<li key={i} className="preview">
					<a
						className="preview__link"
						href={'#' + res.id}
						onClick={() => this.props.onRecipeSelect(res.id)}
					>
						<figure className="preview__fig">
							<img src={res.image_url} alt={res.title} />
						</figure>
						<div className="preview__data">
							<h4 className="preview__title">{res.title}</h4>
							<p className="preview__publisher">{res.publisher}</p>
						</div>
					</a>
				</li>
			);
		});

		// we slice the search results so we only display 10 on the page at a time
		return searchResults.slice(start, end);
	};

	// Generate pagination buttons ----------------------------------------------------------------------------
	pagination = (e) => {
		let leftArrow, rightArrow;
		if (this.state.searchPage > 1) {
			leftArrow = (
				<button
					className="btn--inline pagination__btn--prev"
					onClick={() => {
						this.setState({ searchPage: this.state.searchPage - 1 });
					}}
				>
					<svg className="search__icon">
						<use href={icons + '#icon-arrow-left'}></use>
					</svg>
					<span>{'Page ' + Number(this.state.searchPage - 1)}</span>
				</button>
			);
		}

		if (this.state.searchPage < this.state.maxSearchPages) {
			rightArrow = (
				<button
					className="btn--inline pagination__btn--next"
					onClick={() => {
						this.setState({ searchPage: this.state.searchPage + 1 });
					}}
				>
					<span>{'Page ' + Number(this.state.searchPage + 1)}</span>
					<svg className="search__icon">
						<use href={icons + '#icon-arrow-right'}></use>
					</svg>
				</button>
			);
		}

		return (
			<div className="pagination">
				{leftArrow}
				{rightArrow}
			</div>
		);
	};

	render() {
		// If no query, display nothing
		if (!this.props.query) {
			return null;
		}
		// If loading, display spinner
		if (this.state.isFetching) {
			return loadingSpinner();
		}
		// If theres an error, show error
		if (this.state.error) {
			return renderError(
				`Could not find any recipes that mach your search term. Try another! ${this.state.error}`
			);
		}

		return (
			<React.Fragment>
				<this.parseSearchResults />
				<this.pagination />
			</React.Fragment>
		);
	}
}

export class Bookmarks extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bookmarks: [],
			results: [],
			isFetching: true,
			error: null,
		};
	}

	componentDidUpdate(prevProps) {
		//prettier-ignore
		if (prevProps.incomingBookmarks.length !== this.props.incomingBookmarks.length) { // if the new array is different, we got a new recipe to the bookmark
			this.setState({
				bookmarks: this.props.incomingBookmarks,
			});
			this.fetchRecipe(this.props.incomingBookmarks);

		}
	}

	// Search the API for results ----------------------------------------------------------------------------
	fetchRecipe = async (bookmarks) => {
		this.setState({
			error: null,
		});
		try {
			if (bookmarks.length === 0) {
				this.setState({
					results: [],
				});
				return;
			}
			// If theres more than one bookmark, loop over them to fetch their info
			if (bookmarks.length > 0) {
				const bookmarkLoop = bookmarks.map(async (id) => {
					const data = await getJSON(`${API_URL}/${id}`);
					let { recipe } = data.data;
					return recipe;
				});
				Promise.all(bookmarkLoop).then((bookmarksPromise) => {
					this.setState({
						results: bookmarksPromise,
						isFetching: false,
					});
				});
				return;
			}
		} catch (err) {
			this.setState({
				isFetching: false,
				error: err,
			});
		}
	};

	// Parse the results into their HTML ----------------------------------------------------------------------------
	parseSearchResults = () => {
		const searchResults = this.state.results.map((res, i) => {
			return (
				<li key={i} className="preview">
					<a
						//prettier-ignore
						className={window.location.hash.slice(1) === res.id ? 'preview__link preview__link--active': 'preview__link'}
						href={'#' + res.id}
						onClick={() => this.props.onRecipeSelect(res.id)}
					>
						<figure className="preview__fig">
							<img src={res.image_url} alt={res.title} />
						</figure>
						<div className="preview__data">
							<h4 className="preview__title">{res.title} </h4>
							<p className="preview__publisher">{res.publisher} </p>
						</div>
					</a>
				</li>
			);
		});

		// we slice the search results so we only display 10 on the page at a time
		return searchResults;
	};

	bookmarkMessage() {
		return (
			<div className="message">
				<div>
					<svg>
						<use href={icons + '#icon-smile'}></use>
					</svg>
				</div>
				<p>No bookmarks yet. Find a nice recipe and bookmark it :)</p>
			</div>
		);
	}

	render() {
		// if there is nothing
		if (this.state.results.length === 0) {
			return <this.bookmarkMessage />;
		}
		// If loading, display spinner
		if (this.state.isFetching) {
			return loadingSpinner();
		}
		// If theres an error, show error
		if (this.state.error) {
			return renderError(`You have no bookmarks yet! ${this.state.error}`);
		}

		return (
			<ul className="bookmarks__list">
				<this.parseSearchResults />
			</ul>
		);
	}
}

export class AddRecipe extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			bookmarks: [],
			newRecipeSuccess: null,
			addRecipeIngs: {
				id: 124124,
				title: null,
				sourceUrl: null,
				image: null,
				publisher: null,
				cookingTime: null,
				servings: null,
				ingredients: {
					'ingredient-1': {},
					'ingredient-2': {},
					'ingredient-3': {},
					'ingredient-4': {},
					'ingredient-5': {},
					'ingredient-6': {},
				},
			},
		};
	}

	submitNewRecipe = (e) => {
		e.preventDefault();
		// WE cant send a recipe in anymore because he disabled the feature.
		// So indead I've written sendJSON to just store it to our browser Cache
		let submittedRecipe = sendJSON(
			JSON.stringify(this.state.addRecipeIngs),
			this.state.addRecipeIngs.title
		);

		Promise.resolve(submittedRecipe).then((newId) => {
			const newState = { ...this.state.addRecipeIngs };
			newState.id = newId;
			this.setState({
				addRecipeIngs: newState,
				newRecipeSuccess: true,
			});
		});

		// I cant pass this in as a bookmark because our bookmark api depends on the forkify guys API
		// this.props.showBookmarks(this.state.bookmarks);

		this.props.showAddRecipeBox(e);
	};

	addRecipeIngs = (e) => {
		//Update the state and att the ing to the state
		const newAddRecipeIngs = { ...this.state.addRecipeIngs };
		// Check if its an ingredient
		if (e.target.name.startsWith('ingredient')) {
			// Split the incoming value by comas, and store each result into its object
			const ingArr = e.target.value.replaceAll(' ', '').split(',');

			const [quantity, unit, description] = ingArr;

			newAddRecipeIngs.ingredients[e.target.name] = {
				quantity: quantity ? +quantity : null,
				unit: unit ? unit : null,
				description,
			};
			this.setState({
				addRecipeIngs: newAddRecipeIngs,
			});
			return;
		}
		// else, just change the value
		newAddRecipeIngs[e.target.name] = e.target.value;

		this.setState({
			addRecipeIngs: newAddRecipeIngs,
		});
	};

	render() {
		if (this.state.error) {
			return renderError(`Error! ${this.state.error}`);
		}
		if (this.state.newRecipeSuccess) {
			return message(`New recipe succesfully added!`);
		}
		return (
			<React.Fragment>
				<div
					className="add-recipe-window"
					onSubmit={(e) => this.submitNewRecipe(e)}
				>
					<button
						className="btn--close-modal"
						onClick={(e) => this.props.showAddRecipeBox(e)}
					>
						&times;
					</button>
					<form className="upload">
						<div className="upload__column">
							<h3 className="upload__heading">Recipe data</h3>
							<label>Title</label>

							<input
								required
								name="title"
								type="text"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>URL</label>
							<input
								required
								name="sourceUrl"
								type="text"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Image URL</label>
							<input
								required
								name="image"
								type="text"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Publisher</label>
							<input
								required
								name="publisher"
								type="text"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Prep time</label>
							<input
								required
								name="cookingTime"
								type="number"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Servings</label>
							<input
								required
								name="servings"
								type="number"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
						</div>

						<div className="upload__column">
							<h3 className="upload__heading">Ingredients</h3>
							<label>Ingredient 1</label>
							<input
								type="text"
								required
								name="ingredient-1"
								placeholder="Format: 'Quantity,Unit,Description'"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Ingredient 2</label>
							<input
								type="text"
								name="ingredient-2"
								placeholder="Format: 'Quantity,Unit,Description'"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Ingredient 3</label>
							<input
								type="text"
								name="ingredient-3"
								placeholder="Format: 'Quantity,Unit,Description'"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Ingredient 4</label>
							<input
								type="text"
								name="ingredient-4"
								placeholder="Format: 'Quantity,Unit,Description'"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Ingredient 5</label>
							<input
								type="text"
								name="ingredient-5"
								placeholder="Format: 'Quantity,Unit,Description'"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
							<label>Ingredient 6</label>
							<input
								type="text"
								name="ingredient-6"
								placeholder="Format: 'Quantity,Unit,Description'"
								onChange={(e) => this.addRecipeIngs(e)}
							/>
						</div>

						<button className="btn upload__btn" value="Submit" type="submit">
							<svg>
								<use href={icons + '#icon-upload-cloud'}></use>
							</svg>
							<span>Upload</span>
						</button>
					</form>
				</div>
			</React.Fragment>
		);
	}
}
