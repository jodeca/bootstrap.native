
/* Native JavaScript for Bootstrap 4 | Tooltip
---------------------------------------------- */
import { hasClass } from 'shorter-js/src/class/hasClass.js';
import { addClass } from 'shorter-js/src/class/addClass.js';
import { removeClass } from 'shorter-js/src/class/removeClass.js';
import { on } from 'shorter-js/src/event/on.js';
import { off } from 'shorter-js/src/event/off.js';
import { mouseHoverEvents } from 'shorter-js/src/strings/mouseHoverEvents.js';
import { mouseClickEvents } from 'shorter-js/src/strings/mouseClickEvents.js';
import { touchEvents } from 'shorter-js/src/strings/touchEvents.js';
import { passiveHandler } from 'shorter-js/src/misc/passiveHandler.js';
import { emulateTransitionEnd } from 'shorter-js/src/misc/emulateTransitionEnd.js';
import { queryElement } from 'shorter-js/src/misc/queryElement.js';
// import { tryWrapper } from 'shorter-js/src/misc/tryWrapper.js';

import { bootstrapCustomEvent, dispatchCustomEvent } from '../util/event.js';
import { styleTip } from '../util/misc.js';

// TOOLTIP DEFINITION
// ==================

export default function Tooltip(element,options) {

  // set options
  options = options || {};

  // bind
  let self = this,

      // tooltip, timer, and title
      tooltip = null, timer = 0, titleString,

      // DATA API
      animationData,
      placementData,
      delayData,
      containerData,

      // custom events
      showCustomEvent,
      shownCustomEvent,
      hideCustomEvent,
      hiddenCustomEvent,

      // check container
      containerElement,
      containerDataElement,

      // maybe the element is inside a modal
      modal,

      // maybe the element is inside a fixed navbar
      navbarFixedTop,
      navbarFixedBottom,
      placementClass,
      ops = {};

  // private methods
  function getTitle() {
    return element.getAttribute('title')
        || element.getAttribute('data-title')
        || element.getAttribute('data-original-title')
  }
  function removeToolTip() {
    ops.container.removeChild(tooltip);
    tooltip = null; timer = null;
  }
  function createToolTip() {
    titleString = getTitle(); // read the title again
    if ( titleString ) { // invalidate, maybe markup changed
      // create tooltip
      tooltip = document.createElement('div');

      // set markup
      if (ops.template) {
        let tooltipMarkup = document.createElement('div');
        tooltipMarkup.innerHTML = ops.template.trim();

        tooltip.className = tooltipMarkup.firstChild.className;
        tooltip.innerHTML = tooltipMarkup.firstChild.innerHTML;

        queryElement('.tooltip-inner',tooltip).innerHTML = titleString.trim();
      } else {
        // tooltip arrow
        let tooltipArrow = document.createElement('div');
        addClass(tooltipArrow,'arrow');
        tooltip.appendChild(tooltipArrow);
        // tooltip inner
        let tooltipInner = document.createElement('div');
        addClass(tooltipInner,'tooltip-inner');
        tooltip.appendChild(tooltipInner);
        tooltipInner.innerHTML = titleString;
      }
      // reset position
      tooltip.style.left = '0';
      tooltip.style.top = '0';
      // set class and role attribute
      tooltip.setAttribute('role','tooltip');
      !hasClass(tooltip, 'tooltip') && addClass(tooltip, 'tooltip');
      !hasClass(tooltip, ops.animation) && addClass(tooltip, ops.animation);
      !hasClass(tooltip, placementClass) && addClass(tooltip, placementClass);
      // append to container
      ops.container.appendChild(tooltip);
    }
  }
  function updateTooltip() {
    styleTip(element, tooltip, ops.placement, ops.container);
  }
  function showTooltip() {
    !hasClass(tooltip,'show') && ( addClass(tooltip,'show') );
  }
  function touchHandler(e){
    if ( tooltip && tooltip.contains(e.target) || e.target === element || element.contains(e.target)) {
      // smile
    } else {
      self.hide()
    }
  }
  // triggers
  function showAction() {
    on( document, touchEvents.start, touchHandler, passiveHandler );
    on( window, 'resize', self.hide, passiveHandler );
    dispatchCustomEvent.call(element, shownCustomEvent);
  }
  function hideAction() {
    off( document, touchEvents.start, touchHandler, passiveHandler );
    off( window, 'resize', self.hide, passiveHandler );
    removeToolTip();
    dispatchCustomEvent.call(element, hiddenCustomEvent);
  }
  function toggleEvents(action) {
    action(element, mouseClickEvents.down, self.show);
    action(element, mouseHoverEvents[0], self.show);
    action(element, mouseHoverEvents[1], self.hide);
  }

  // public methods
  self.show = () => {
    clearTimeout(timer);
    timer = setTimeout( () => {
      if (tooltip === null) {
        dispatchCustomEvent.call(element, showCustomEvent);
        if (showCustomEvent.defaultPrevented) return;
        // if(createToolTip() == false) return;
        if(createToolTip() !== false) {
          updateTooltip();
          showTooltip();
          !!ops.animation ? emulateTransitionEnd(tooltip, showAction) : showAction();
        }
      }
    }, 20 );
  };
  self.hide = () => {
    clearTimeout(timer);
    timer = setTimeout( () => {
      if (tooltip && hasClass(tooltip,'show')) {
        dispatchCustomEvent.call(element, hideCustomEvent);
        if (hideCustomEvent.defaultPrevented) return;
        removeClass(tooltip,'show');
        !!ops.animation ? emulateTransitionEnd(tooltip, hideAction) : hideAction();
      }
    }, ops.delay);
  };
  self.toggle = () => {
    if (!tooltip) { self.show(); }
    else { self.hide(); }
  };
  self.dispose = () => {
    toggleEvents(off);
    self.hide();
    element.setAttribute('title', element.getAttribute('data-original-title'));
    element.removeAttribute('data-original-title');
    delete element.Tooltip;
  };

  // init
  // initialization element
  element = queryElement(element);

  // reset on re-init
  element.Tooltip && element.Tooltip.dispose();

  // DATA API
  animationData = element.getAttribute('data-animation')
  placementData = element.getAttribute('data-placement')
  delayData = element.getAttribute('data-delay')
  containerData = element.getAttribute('data-container')

  // custom events
  showCustomEvent = bootstrapCustomEvent('show', 'tooltip')
  shownCustomEvent = bootstrapCustomEvent('shown', 'tooltip')
  hideCustomEvent = bootstrapCustomEvent('hide', 'tooltip')
  hiddenCustomEvent = bootstrapCustomEvent('hidden', 'tooltip')

  // check container
  containerElement = queryElement(options.container)
  containerDataElement = queryElement(containerData)

  // maybe the element is inside a modal
  modal = element.closest('.modal')

  // maybe the element is inside a fixed navbar
  navbarFixedTop = element.closest('.fixed-top')
  navbarFixedBottom = element.closest('.fixed-bottom')

  // set instance options
  ops.animation = options.animation && options.animation !== 'fade' ? options.animation : animationData || 'fade';
  ops.placement = options.placement ? options.placement : placementData || 'top';
  ops.template = options.template ? options.template : null; // JavaScript only
  ops.delay = parseInt(options.delay || delayData) || 200;
  ops.container = containerElement ? containerElement
                          : containerDataElement ? containerDataElement
                          : navbarFixedTop ? navbarFixedTop
                          : navbarFixedBottom ? navbarFixedBottom
                          : modal ? modal : document.body;

  // set placement class
  placementClass = `bs-tooltip-${ops.placement}`

  // set tooltip content
  titleString = getTitle();

  // invalidate
  if ( !titleString ) return;

  // prevent adding event handlers twice
  if (!element.Tooltip) {
    element.setAttribute('data-original-title',titleString);
    element.removeAttribute('title');
    toggleEvents(on);
  }

  // associate target to init object
  element.Tooltip = self;

}

