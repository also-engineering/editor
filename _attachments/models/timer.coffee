throw "No assessment loaded" if $.assessment is undefined

# Live handler for buttons in timer control
$("div.timer a").live 'click', (eventData) =>
  buttonPressed = eventData.target.innerHTML
# Call the timer method that has the same name as the button just pressed, i.e. "start" 
  $.assessment.currentPage.timer[buttonPressed]()

class Timer
  constructor: ->
    @elementLocation = null

  toJSON: ->
    JSON.stringify {
      seconds: @seconds,
      elementLocation: @elementLocation
    }

  setPage: (@page) ->
    @elementLocation = "div##{page.pageId} div.timer"

  start: ->
    return if @running
    @running = true
    @tick_value = 1
    decrement = =>
      @seconds -= @tick_value
      clearInterval(@intervalId) if @seconds == 0
      @renderSeconds()
    @intervalId = setInterval(decrement,@tick_value*1000)

  stop: ->
    @running = false
    clearInterval(@intervalId)

  reset: ->
    @seconds = 60
    @renderSeconds()

  renderSeconds: ->
    $("#{@elementLocation} span.timer_seconds").html(@seconds)

  render: ->
    @id = "timer"
    @seconds = 60
    Mustache.to_html(Template.Timer(),this)

Template.Timer = () -> "
<div class='timer'>
  <span class='timer_seconds'>{{seconds}}</span>
  <a href='#' data-role='button'>start</a>
  <a href='#' data-role='button'>stop</a>
  <a href='#' data-role='button'>reset</a>
</div>
"

