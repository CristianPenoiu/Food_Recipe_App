const app = new Vue({
  el: '#app',
  data: {
    recipes: [],
    searchQuery: '',
    searchResults: [],
    currentPage: 1,
    currentSearchPage: 1,
    pageSize: 20,
    selectedRecipe: null,
    showAllColumns: true // Added property to control column display
  },
  computed: {
    // Calculate the index of the first recipe for the current page
    startIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    // Calculate the index of the first search result for the current page
    startSearchIndex() {
      return (this.currentSearchPage - 1) * this.pageSize;
    },
    // Slice the recipes array to display only the recipes for the current page
    slicedRecipes() {
      const start = this.startIndex;
      const end = start + this.pageSize;
      return this.recipes.slice(start, end);
    },
    // Slice the search results array to display only the results for the current page
    slicedSearchResults() {
      const start = this.startSearchIndex;
      const end = start + this.pageSize;
      return this.searchResults.slice(start, end);
    },
    // Calculate the total number of pages for main recipes
    totalPages() {
      return Math.ceil(this.recipes.length / this.pageSize);
    },
    // Calculate the total number of pages for search results
    totalSearchPages() {
      return Math.ceil(this.searchResults.length / this.pageSize);
    }
  },
  methods: {
    async fetchRecipes() {
      try {
        this.showAllColumns = true;
        const response = await fetch('http://localhost:3000/api/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        // Sort the recipes alphabetically by name
        data.sort((a, b) => a.name.localeCompare(b.name));
        this.recipes = data;
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    },
    async searchRecipesByName() {
      try {
        this.showAllColumns = true;
        const response = await fetch(`http://localhost:3000/api/search/${this.searchQuery}`);
        if (!response.ok) {
          throw new Error('Failed to search recipes');
        }
        const data = await response.json();
        // Update searchResults with the received data
        this.searchResults = data;
        // Reset current search page to 1
        this.currentSearchPage = 1;
      } catch (error) {
        console.error('Error searching for recipes:', error);
      }
    },
    async fetchRecipeDetails(name) {
      try {
        console.log("Fetching details for recipe:", name); // Add this line to check if the method is called
        const response = await fetch(`http://localhost:3000/api/recipe/details/${name}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        } 
        const data = await response.json();
        this.selectedRecipe = data[0];
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    },
    async searchRecipesByIngredients() {
      try {
        this.showAllColumns = true;
        console.log("Fetching details for recipe:", this.searchQuery); // Add this line to check if the method is called
        const response = await fetch(`http://localhost:3000/api/search/ingredients/${this.searchQuery}`);
        if (!response.ok) {
          throw new Error('Failed to search recipes');
        }
        const data = await response.json();
        // Update searchResults with the received data
        this.searchResults = data;
        // Reset current search page to 1
        this.currentSearchPage = 1;
      } catch (error) {
        console.error('Error searching for recipes:', error);
      }
    },
    async fetchRecipesByAuthor(authorName) {
      try {
        this.showAllColumns = false;
        const response = await fetch(`http://localhost:3000/api/search/recipes/by/author/${authorName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        // Update searchResults with the received data, but only include the necessary fields
        this.searchResults = data.map(recipe => ({
          name: recipe.name,
          action: 'Details'
        }));
        // Reset current search page to 1
        this.currentSearchPage = 1;
      } catch (error) {
        console.error('Error fetching recipes by author:', error);
      }
    },
    closeRecipeDetails() {
      this.selectedRecipe = null;
    },
    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPreviousSearchPage() {
      if (this.currentSearchPage > 1) {
        this.currentSearchPage--;
      }
    },
    goToNextSearchPage() {
      if (this.currentSearchPage < this.totalSearchPages) {
        this.currentSearchPage++;
      }
    }
  },
  mounted() {
    this.fetchRecipes();
  }
});
