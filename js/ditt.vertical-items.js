(function () {
    // init vars
    var container_id = 'container', wrapper_id = 'wrapper', column_width = 200, 
        old_columns = 0, column_class = 'rows', article_class = 'articles', 
        width_offset = 3, columns = [], articles = [];

    // init adding articles to columns
    addArticlesToColumns(document.getElementById(container_id), document.getElementById(wrapper_id));

    // init addEventListener on browser where it doesn't exist
    if (!window.addEventListener) {
        window.addEventListener = function (type, listener, useCapture) {
            attachEvent('on' + type, function(event) { 
                listener(event);
            });
        }
    }

    // use an event to do this on resize when column number changes
    if (window.addEventListener) {
        window.addEventListener('resize', function () {
            addArticlesToColumns(document.getElementById(container_id), document.getElementById(wrapper_id));
        }, false);
    }

    /**
     * Adds articles to columns to create a pinterest-style design.
     * 
     * @param container The container to articles are already in and where the
     * sections will go
     * @return boolean 
     */
    function addArticlesToColumns(container, wrapper) {
        // init vars
        var width, num_columns, i, new_section, new_article, article_height, 
            sections, column;

        // check to see of there's been a change in the number of columns
        width = container.clientWidth - width_offset;
        num_columns = Math.floor(width / column_width);
        if (num_columns === old_columns) {
            return false;
        }

        // keep the wrapper in the center of the page
        wrapper.style.width = (num_columns * column_width + width_offset) + 'px';

        // removes any sections that already exist
        sections = getNodesByFakeIds(column_class, wrapper, 'section', function (element) {
            // init vars
            var found_articles, i;

            // grabs any articles that exist in these sections and save them
            found_articles = element.getElementsByTagName('article');
            for (i = 0; i < found_articles.length; i ++) {
                articles[found_articles[i].getAttribute('data-id')] = found_articles[i];
            }
        }, true);

        // otherwise remove any articles that currently exist
        if (sections.length === 0) {
            // removes the articles from the page and bumps them to the store
            getNodesByFakeIds(article_class, wrapper, 'article', function (element, i) {
                element.style.display = 'block';
                element.setAttribute('data-id', i);
                articles[i] = element;
            }, true);

        }

        // add new columns to the wrapper
        columns = [];
        for (i = 0; i < num_columns; i ++) {
            // create the column
            new_section = document.createElement('section');
            new_section.className = column_class;
            new_section.id = column_class + '_' + i;
            new_section.setAttribute('data-id', i);
            wrapper.appendChild(new_section);

            // create / reset the row height store
            columns[i] = 0;
        }

        // move the articles (using removeChild and attachChild) to the lowest-height column
        for (i = 0; i < articles.length; i ++) {
            new_article = articles[i];
            article_height = new_article.clientHeight;

            // calculate which column to use next
            column = getNextColumn(column_class, article_height);
            if (column) {
                // add the article
                column.appendChild(new_article);

                // remove the article from the store to save memory
                articles[i] = null;

                // increment the height of the given column
                columns[column.getAttribute('data-id')] += new_article.clientHeight;
            }
        }

        // store the new number of columns
        old_columns = num_columns;
    }

    /**
     * Gets nodes using fake ids so that we can delete them without screwing
     * the looping structure, as happens with getElementsByTagName
     * 
     * @param prefix The prefix for the fake ids
     * @param parent_node The parent_node to find the tag_name in. This can
     * be document
     * @param tag_name A string representing the tag name to find within the 
     * parent
     * @param callback The callback function to allow extra functionality
     * @param delete_node A boolean that if set to true will also remove the
     * found node
     */
    function getNodesByFakeIds(prefix, parent_node, tag_name, callback, delete_node) {
        // init vars
        var ids = [], ids_length, nodes, nodes_length, i, found_item, found = [];

        // gets or creates the ids of the elements to retrieve
        nodes = parent_node.getElementsByTagName(tag_name);
        nodes_length = nodes.length;
        for (i = 0; i < nodes_length; i ++) {
            // make sure each article has an id
            if (!nodes[i].id) {
                nodes[i].id = prefix + '_' + i;
            }
            ids.push(nodes[i].id);
        }

        // if any ids have been found, retrieve the elements in an array
        // that won't change size when items are deleted (like getElementsByTagName)
        ids_length = ids.length;
        for (i = 0; i < ids_length; i ++) {
            found_item = document.getElementById(ids[i]);
            found.push(found_item, ids[i]);

            // run the callback
            callback(found_item, i);

            // delete if requested
            if (delete_node === true) {
                found_item.parentNode.removeChild(found_item);
            }
        }

        return found;
    }

    /**
     * Gets the next available column to put an article in to. Relies on columns var
     * being global for this scope
     * 
     * @param column_class The class of the column so we can find the column to return
     * 
     * @return DomElement The next column to add an article to
     */
    function getNextColumn(column_class) {
        // init vars
        var lowest = null, i, num_columns, element;

        // loop through the columns looking for the lowest number
        num_columns = columns.length;
        for (i = 0; i < num_columns; i ++) {
            if (lowest === null || columns[i] < columns[lowest]) {
                lowest = i;
            }
        }

        // get the element
        element = document.getElementById(column_class + '_' + lowest);
        if (!element) {
            return null;
        }

        return element;
    }

})();