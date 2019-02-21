import fetch from "../util/fetch-fill";
import URI from "urijs";

const itemsPerPage = 10;

// records endpoint
window.path = "http://localhost:3000/records";

// fetches page of items and transforms result into object
// reference https://github.com/adhocteam/homework/tree/master/fetch for details
function retrieve(options) {
	let page, colors;
	if (typeof options !== "undefined") {
		({ page, colors } = options);
	}
	if (typeof page === "undefined") {
		page = 1;
	}

	const offset = page * itemsPerPage - itemsPerPage;
	return getRecords(offset, colors)
		.then(items => {
			return createResponse(items, page, offset, colors);
		})
		.catch(error => console.log(error));
}

// gets data from /records endpoint
function getRecords(offset, colors) {
	const uri = new URI(window.path);
	uri.search({ limit: itemsPerPage, offset: offset, "color[]": colors });
	return fetch(uri)
		.then(response => {
			if (!response.ok) {
				console.log("Request was unsuccessful");
				return [];
			} else {
				return response.json();
			}
		})
		.catch(error => console.log(error));
}

// creates requested object from fetched items
function createResponse(items, page, offset, colors) {
	return getNextPage(page, offset, colors)
		.then(nextPage => {
			return {
				ids: items.map(getID),
				open: getOpen(items),
				closedPrimaryCount: getClosedPrimaryCount(items),
				previousPage: page === 1 ? null : page - 1,
				nextPage: nextPage
			};
		})
		.catch(error => console.log(error));
}

// if next page of results exists returns number of next page, else returns null
// note: currOffset param is the offset of the current page
function getNextPage(currPage, currOffset, colors) {
	return getRecords(currOffset + itemsPerPage, colors)
		.then(items => {
			if (items.length === 0) {
				return null;
			} else {
				return currPage + 1;
			}
		})
		.catch(error => console.log(error));
}

// mapping function, returns id of item
function getID(item) {
	return item.id;
}

// returns array of all items with disposition of "open" and adds key/value pair isPrimary
// to each item indicating whether item contains a primary color
function getOpen(items) {
	const open = items.filter(isOpen);
	return open.map(setPrimary);
}

// returns the total number of items with disposition of "closed" and contain a primary color
function getClosedPrimaryCount(items) {
	const closedPrim = items.filter(isClosedPrimary);
	return closedPrim.length;
}

// filter function, returns true if item disposition is "closed" and contains a primary color
function isClosedPrimary(item) {
	return item.disposition === "closed" && isPrimary(item);
}

// filter function, returns true if item disposition is "open"
function isOpen(item) {
	return item.disposition === "open";
}

// mapping function, adds key/value pair isPrimary to item indicating whether item contains
// a primary color
function setPrimary(item) {
	item.isPrimary = isPrimary(item);
	return item;
}

// returns true if item contains a primary color
function isPrimary(item) {
	return (
		item.color === "red" || item.color === "blue" || item.color === "yellow"
	);
}

export default retrieve;
