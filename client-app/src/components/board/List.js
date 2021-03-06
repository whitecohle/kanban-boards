import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import NewCard from './NewCard'
import ListDeleteButton from '../buttons/ListDeleteButton'
import { generateId, addItem, updateList, removeItem } from '../../utils/helpers'
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPaper } from '@fortawesome/free-solid-svg-icons'
import { Scrollbars } from 'react-custom-scrollbars';
import { createCard, saveCard, destroycard } from './../../utils/service';

class List extends Component {
  state = {
    list: {
      name: '',
      boardId: '',
      items: []
    },
    newCard: {
      name: '',
      desc: '',
      startDate: '',
      endDate: '',
      KanbanListId: ''
    }
  }
  componentDidMount() {
    this.setState({
      list: {
        name: this.props.name,
        boardId: this.props.board.id,
        items: this.props.items
      }
    })
  }  
  handleChange = e => {
    const val = e.target.value;
    this.setState(prevState => ({
        list: {
            ...prevState.list,
            name: val
        }
    }))
  }
  handleCardChange = e => {
    const val = e.target.value;
    this.setState(prevState => ({
        newCard: {
            ...prevState.newCard,
            name: val
        }
    }))
  }
  handleCardRemove = id => {
    destroycard(id)
    const updatedCards = removeItem(this.props.items, id)
    const updatedList = {
        ...this.state.list,
        id: this.props.id,
        items: updatedCards
    }
    this.setState(prevState => ({
      list: {
          ...prevState.list,
          items: updatedCards
      }
  }))
  // this.porps.handleListChangeClient(updatedList);
    this.props.handleListChange(updatedList);
  }
  handleCardEdit = card => {
    saveCard(card)
    const updatedCards = updateList(this.props.items, card);
    const updatedList = {
      ...this.state.list,
      id: this.props.id,
      items: updatedCards
    }
    this.setState(prevState => ({
        list: {
            ...prevState.list,
            items: updatedCards
        }
    }))
    // this.porps.handleListChangeClient(updatedList);
    this.props.handleListChange(updatedList);
  }
  handleSubmit = e => {
    e.preventDefault()
    const updatedList = {
      ...this.state.list,
      id: this.props.id,
      name: this.state.list.name
    }
    // this.porps.handleListChangeClient(updatedList);
    this.props.handleListChange(updatedList)
  }
  handleCardSubmit = e => {
    e.preventDefault()
    const newCard = {
      ...this.state.newCard,
      KanbanListId: this.props.listid,
      name: this.state.newCard.name,
    }
    createCard(newCard)
    const updatedItems = addItem(this.state.list.items, newCard)
    console.log(newCard)
    console.log(updatedItems)
    const updatedList = {
      ...this.state.list,
      id: this.props.id,
      items: updatedItems
    }
    this.setState(prevState => ({
      list: {
        ...prevState.list,
        items: updatedItems
      },
      newCard: {
          ...prevState.newCard,
          name: ''
      }
    }))
    // this.porps.handleListChangeClient(updatedList);
    this.props.handleListChange(updatedList);
  }
  render() {
    return (
      <Droppable droppableId={this.props.id} type="card">
        {(provided, snapshot) => (
          <div className={`list${snapshot.isDraggingOver ? ' list--drag-over' : ''}`}>
            <form onSubmit={this.handleSubmit}>
              <div className="list__header">
                  <input onChange={this.handleChange} onBlur={this.handleSubmit} className="list__title" value={this.state.list.name}/>
                  <FontAwesomeIcon className="list__icon list__icon--hand" icon={faHandPaper}/>
                  <ListDeleteButton theme="list" handleRemove={() => this.props.handleRemove(this.props.id)} />
              </div>
            </form>
            {/* <Scrollbars> */}
            <div className="list__cards-wrapper" ref={provided.innerRef}>
            
            {this.props.items.map((card, index) => ( 
              <Draggable
                  type="card"
                  key={card.id}
                  draggableId={card.id}
                  index={index}>
                    {(provided, snapshot) => (
                      <div
                        className={snapshot.isDragging ? 'card__wrapper card__wrapper-active' : 'card__wrapper'}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}>
                        <Card key={card.id} {...card} handleCardRemove={this.handleCardRemove} handleCardEdit={this.handleCardEdit} listid={ this.props.listid } />
                      </div>
                    )}
              </Draggable>
            ))}
            {provided.placeholder}
            <NewCard 
              newCard={this.state.newCard} 
              handleChange={this.handleCardChange}
              handleSubmit={this.handleCardSubmit}/>
              
            </div>
            {/* </Scrollbars> */}
          </div>
        )}
      </Droppable>
    )
  }
}
List.propTypes = {
    id: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    handleRemove: PropTypes.func.isRequired,
    handleListChange: PropTypes.func.isRequired
}

export default List;