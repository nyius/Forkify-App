import logo from './logo.png';
import './scss/index.scss';
// eslint-disable-next-line
import React, { useRef } from 'react';
import icons from './img/icons.svg';
import { Recipe, LoadSearchResults, Bookmarks, AddRecipe } from './model.js';
import { message, overlay } from './helpers.js';

// https://forkify-api.herokuapp.com/v2

class MainHtml extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showAddRecipe: false,
			searchQuery: '',
			search: false,
			bookmarks: [],
			id: null,
			addRecipeIngs: [
				['title', null],
				['sourceUrl', null],
				['image', null],
				['publisher', null],
				['cookingTime', null],
				['servings', null],
				['ingredient-1', null],
				['ingredient-2', null],
				['ingredient-3', null],
				['ingredient-4', null],
				['ingredient-5', null],
				['ingredient-6', null],
			],
		};
	}

	componentDidMount() {
		// if the user was on a recipe already, reload that same recipe based on the hash url
		if (window.location.hash) {
			// check if the user has any stored bookmarks, or stored search query
			const storedSearch = localStorage.getItem('searchQuery');
			let storedBookmarks = localStorage.getItem('bookmarks');
			if (storedBookmarks === null) storedBookmarks = [];

			this.setState({
				id: window.location.hash.slice(1),
				searchQuery: storedSearch,
				bookmarks: JSON.parse(storedBookmarks),
			});
		}
	}

	// Whenever the search changes, update our state ----------------------------------------------------------------------------
	searchFieldChange = (e) => {
		this.setState({
			searchInput: e.target.value,
		});
		// Save their search incase they reload the page
		localStorage.setItem('searchQuery', JSON.stringify(e.target.value));
	};

	// Render the search field ----------------------------------------------------------------------------
	searchField = () => {
		return (
			<form className="search" onSubmit={(e) => this.runSearch(e)}>
				<input
					type="text"
					className="search__field"
					placeholder="Search over 1,000,000 recipes..."
					onChange={(e) => this.searchFieldChange(e)}
				/>
				<button className="btn search__btn" value="Submit" type="submit">
					<svg className="search__icon">
						<use href={icons + '#icon-search'}></use>
					</svg>
					<span>Search</span>
				</button>
			</form>
		);
	};

	// When the user searches, this sets the search query ----------------------------------------------------------------------------
	runSearch = (e) => {
		e.preventDefault();
		this.setState({
			searchQuery: this.state.searchInput,
		});
	};

	// When the user selects a recipe, this sets that recips id ----------------------------------------------------------------------------
	onRecipeSelect = (e) => {
		// by setting ID, this passes the if statement in the render, calling
		// the <recipe> class and passing in the id to it
		this.setState({
			id: e,
		});
	};

	// Display the users bookmarks ----------------------------------------------------------------------------
	showBookmarks = (e) => {
		// we destructure to make a copy of our state, otherwise we're just modifying the state
		let newBookmarks = [...this.state.bookmarks];

		// if we already have the bookmark, remove it from our list
		if (newBookmarks.includes(this.state.id)) {
			const index = newBookmarks.indexOf(this.state.id);
			newBookmarks.splice(index);

			this.setState({
				bookmarks: newBookmarks,
			});

			// Re-save our cache bookmark ----------------------------------------------------------------------------
			this.persistBookmarks(newBookmarks);

			return;
		} else {
			// if we dont have it, add it to our list
			newBookmarks.push(this.state.id);

			this.setState({
				bookmarks: newBookmarks,
			});

			// Re-save our cache bookmark ----------------------------------------------------------------------------
			this.persistBookmarks(newBookmarks);

			return;
		}
	};

	// Create bookmarks ----------------------------------------------------------------------------
	persistBookmarks = (bookmarks) => {
		//prettier-ignore
		localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
	};

	// Display or Hide the add a new recipe box ----------------------------------------------------------------------------
	showAddRecipeBox = (e) => {
		e.preventDefault();
		if (this.state.showAddRecipe) {
			this.setState({
				showAddRecipe: false,
			});
		} else {
			this.setState({
				showAddRecipe: true,
			});
		}
	};

	render() {
		//prettier-ignore
		let recipe,messageText, addRecipeOverlay, addRecipeForm = null;
		if (this.state.id) {
			recipe = (
				// Give the recipeId to the recipe class
				// Give the bookmarks to the Bookmarks class
				<Recipe
					recipeId={this.state.id}
					showBookmarks={this.showBookmarks}
					bookmarks={this.state.bookmarks}
				/>
			);
		} else {
			messageText = message(`Search our database for over 1,000,000 recipes!`);
		}
		if (this.state.showAddRecipe) {
			addRecipeOverlay = overlay();
			addRecipeForm = (
				<AddRecipe
					showAddRecipeBox={this.showAddRecipeBox}
					showBookmarks={this.showBookmarks}
					bookmarks={this.state.bookmarks}
				/>
			);
		}

		return (
			<div className="Forkify">
				<div className="container">
					{/* ---------------------------------- Search bar ---------------------------------- */}
					<header className="header">
						<img src={logo} alt="Logo" className="header__logo" />

						<this.searchField />

						{/*---------------------------------- Nav Bar ----------------------------------*/}
						<nav className="nav">
							<ul className="nav__list">
								<li className="nav__item">
									<button
										className="nav__btn nav__btn--add-recipe"
										onClick={this.showAddRecipeBox}
									>
										<svg className="nav__icon">
											<use href={icons + '#icon-edit'}></use>
										</svg>
										<span>Add recipe</span>
									</button>
								</li>
								<li className="nav__item">
									{/*---------------------------------- Bookmarks {/*---------------------------------- */}
									<button className="nav__btn nav__btn--bookmarks">
										<svg className="nav__icon">
											<use href={icons + '#icon-bookmark'}></use>
										</svg>
										<span>Bookmarks</span>
									</button>
									<div className="bookmarks">
										<Bookmarks
											// bookmarks={this.state.bookmarks}
											incomingBookmarks={this.state.bookmarks}
											onRecipeSelect={this.onRecipeSelect}
										/>
									</div>
								</li>
							</ul>
						</nav>
					</header>
					{/* ---------------------------------- Search Results---------------------------------- */}
					<div className="search-results">
						<ul className="results">
							<LoadSearchResults
								// set the search query to this sates searchQuery
								query={this.state.searchQuery}
								// When a recipe is clicked, run this function
								onRecipeSelect={this.onRecipeSelect}
							/>
						</ul>

						<p className="copyright">
							&copy; Copyright by Joseph Scicluna 2021
						</p>
					</div>

					{/* ---------------------------------- Show Recipe ------------------------- */}
					<div className="recipe">
						{recipe}
						{messageText}
					</div>
				</div>
				{/*---------------------------------- Overlay/Add recipe ----------------------------------*/}
				{addRecipeOverlay}
				{addRecipeForm}
			</div>
		);
	}
}

function App() {
	return <MainHtml />;
}

export default App;
