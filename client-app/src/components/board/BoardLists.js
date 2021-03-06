import React, {Component} from 'react'
import PropTypes from 'prop-types'
import List from  './List'
import NewList from './NewList'
import { generateId, addItem, updateList, removeItem, findById, reorder, move } from '../../utils/helpers'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { createList, saveList, destroylist, saveCard } from './../../utils/service';

class BoardLists extends Component {
  state = {
    newListName: ''
  }
  handleChange = e => {
    this.setState({newListName: e.target.value})
  }
  handleSubmit = e => {
    e.preventDefault()
    const newList = {
      "boardId": this.props.board.id,
      "name": this.state.newListName,
      "items": []
    }
    createList(newList)
    this.setState({newListName: ''})
    const updatedLists = addItem(this.props.lists, newList);
    this.props.handleListsUpdate(updatedLists);
  }
  handleRemove = id => {
    destroylist(id)
    const updatedLists = removeItem(this.props.lists, id);
    this.props.handleListsUpdate(updatedLists);
  }
  handleListChange = list => {
    saveList(list)
    const updatedLists = updateList(this.props.lists, list);
    this.props.handleListsUpdate(updatedLists);
  }
  handleListChangeClient = list => {
    const updatedLists = updateList(this.props.lists, list);
    this.props.handleListsUpdate(updatedLists);
  }
  onDragEnd = result => {
    const { source, destination } = result;
    const sourceList = findById(source.droppableId, this.props.lists)
    const acutalCard = findById(result.draggableId, sourceList.items)
    // KanbanListId
    acutalCard.KanbanListId = destination.droppableId
    saveCard(acutalCard)

    if (!destination) {
        return;
    }

    if (source.droppableId === this.props.id) {
      const items = reorder(
        this.props.lists,
        source.index,
        destination.index
      )
      this.props.handleListsUpdate(items)
    } else if (source.droppableId === destination.droppableId) {
        const list = findById(source.droppableId, this.props.lists)
        const items = reorder(
            list.items,
            source.index,
            destination.index
        );
        const newList = {
          ...list,
          items: items
        }
        // saveList(newList)
        // this.handleListChange(newList)
        const updatedLists = updateList(this.props.lists, newList);
        this.props.handleListsUpdate(updatedLists);
    } else {
        const sourceList = findById(source.droppableId, this.props.lists)
        const destList = findById(destination.droppableId, this.props.lists)
        const result = move(
            sourceList.items,
            destList.items,
            source,
            destination
        );
        const newSourceList = {
          ...sourceList,
          items: result[source.droppableId]
        }
        const newDestList = {
          ...destList,
          items: result[destination.droppableId]
        }
        // console.log(result)
        // this.handleListChange(newSourceList)
        // saveList(newSourceList)
        // this.handleListChange(newDestList)
        // saveList(newDestList)
        const updatedLists = updateList(this.props.lists, newSourceList);
        this.props.handleListsUpdate(updatedLists);
        const updatedListsNew = updateList(this.props.lists, newDestList);
        this.props.handleListsUpdate(updatedListsNew);
      }
  }
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div className="board-lists__wrapper">
              <Droppable droppableId={this.props.id} direction="horizontal" type="list">
              {(provided, snapshot) => (
                <div
                  className="board-lists"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {this.props.lists.map((list, index) => (
                    <Draggable key={list.id} draggableId={list.id} index={index} type="list">
                      {(provided, snapshot) => (
                        <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                          <List board={this.props.board} handleListChangeClient={this.handleListChangeClient} handleListChange={this.handleListChange} handleRemove={this.handleRemove} key={list.id} listid={list.id} {...list}/>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <NewList
                    newListName={this.state.newListName}
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit} />
                </div>
              )}
              </Droppable>
        </div>
      </DragDropContext>
    )
  }
} 

BoardLists.propTypes = {
    id: PropTypes.number.isRequired,
    lists: PropTypes.array.isRequired,
    handleListsUpdate: PropTypes.func.isRequired
}

export default BoardLists;