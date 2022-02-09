
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Navbar.svelte generated by Svelte v3.46.4 */

    const file$4 = "src/Navbar.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "NETTILEHTI";
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Uutiset";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Urheilu";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Viihde";
    			attr_dev(h1, "class", "svelte-555e86");
    			add_location(h1, file$4, 7, 6, 102);
    			add_location(div0, file$4, 6, 4, 90);
    			attr_dev(p0, "class", "svelte-555e86");
    			add_location(p0, file$4, 10, 6, 165);
    			attr_dev(p1, "class", "svelte-555e86");
    			add_location(p1, file$4, 11, 6, 227);
    			attr_dev(p2, "class", "svelte-555e86");
    			add_location(p2, file$4, 12, 6, 289);
    			attr_dev(div1, "class", "buttons svelte-555e86");
    			add_location(div1, file$4, 9, 4, 137);
    			attr_dev(div2, "class", "navbar svelte-555e86");
    			add_location(div2, file$4, 5, 2, 65);
    			add_location(main, file$4, 4, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(div1, t5);
    			append_dev(div1, p2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(p1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(p2, "click", /*click_handler_2*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let { newsclass = 'Uutiset' } = $$props;
    	const writable_props = ['newsclass'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, newsclass = 'Uutiset');
    	const click_handler_1 = () => $$invalidate(0, newsclass = 'Urheilu');
    	const click_handler_2 = () => $$invalidate(0, newsclass = 'Viihde');

    	$$self.$$set = $$props => {
    		if ('newsclass' in $$props) $$invalidate(0, newsclass = $$props.newsclass);
    	};

    	$$self.$capture_state = () => ({ newsclass });

    	$$self.$inject_state = $$props => {
    		if ('newsclass' in $$props) $$invalidate(0, newsclass = $$props.newsclass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [newsclass, click_handler, click_handler_1, click_handler_2];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { newsclass: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get newsclass() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set newsclass(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getAllNews = fetch(
      'https://api.il.fi/v1/columns/sidecolumns/uutiset'
    )
      .then((response) => response.json())
      .then((data) => {
        return data.response[0].blocks[0].content.articles;
      });

    const getSportNews = fetch(
      'https://api.il.fi/v1/columns/sidecolumns/urheilu'
    )
      .then((response) => response.json())
      .then((data) => {
        return data.response[0].blocks[0].content.articles;
      });

    const getEntNews = fetch(
      'https://api.il.fi/v1/columns/sidecolumns/viihde'
    )
      .then((response) => response.json())
      .then((data) => {
        return data.response[0].blocks[0].content.articles;
      });

    /* src/Uutinen.svelte generated by Svelte v3.46.4 */

    const file$3 = "src/Uutinen.svelte";

    function create_fragment$3(ctx) {
    	let a;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*news*/ ctx[0].headline + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*news*/ ctx[0].lead + "";
    	let t3;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			if (!src_url_equal(img.src, img_src_value = /*news*/ ctx[0].main_image_urls.size138)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1bdtrk5");
    			add_location(img, file$3, 9, 6, 224);
    			add_location(div0, file$3, 8, 4, 212);
    			attr_dev(h1, "class", "svelte-1bdtrk5");
    			add_location(h1, file$3, 12, 6, 301);
    			attr_dev(p, "class", "svelte-1bdtrk5");
    			add_location(p, file$3, 13, 6, 332);
    			add_location(div1, file$3, 11, 4, 289);
    			attr_dev(div2, "class", "news svelte-1bdtrk5");
    			add_location(div2, file$3, 7, 2, 189);
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noreferrer noopener");
    			attr_dev(a, "class", "svelte-1bdtrk5");
    			add_location(a, file$3, 6, 0, 130);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*news*/ 1 && !src_url_equal(img.src, img_src_value = /*news*/ ctx[0].main_image_urls.size138)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*news*/ 1 && t1_value !== (t1_value = /*news*/ ctx[0].headline + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*news*/ 1 && t3_value !== (t3_value = /*news*/ ctx[0].lead + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Uutinen', slots, []);
    	let { news } = $$props;
    	const url = `https://iltalehti.fi/${news.category.category_name}/a/${news.article_id}`;
    	const writable_props = ['news'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Uutinen> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('news' in $$props) $$invalidate(0, news = $$props.news);
    	};

    	$$self.$capture_state = () => ({ news, url });

    	$$self.$inject_state = $$props => {
    		if ('news' in $$props) $$invalidate(0, news = $$props.news);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [news, url];
    }

    class Uutinen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { news: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Uutinen",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*news*/ ctx[0] === undefined && !('news' in props)) {
    			console.warn("<Uutinen> was created without expected prop 'news'");
    		}
    	}

    	get news() {
    		throw new Error("<Uutinen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set news(value) {
    		throw new Error("<Uutinen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Uutiset.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$2 = "src/Uutiset.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>   import { getAllNews, getEntNews, getSportNews }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import { getAllNews, getEntNews, getSportNews }",
    		ctx
    	});

    	return block;
    }

    // (30:2) {:then newslist}
    function create_then_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*newslist*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newslist*/ 1) {
    				each_value = /*newslist*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(30:2) {:then newslist}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#each newslist as news}
    function create_each_block(ctx) {
    	let uutinen;
    	let current;

    	uutinen = new Uutinen({
    			props: { news: /*news*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(uutinen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(uutinen, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const uutinen_changes = {};
    			if (dirty & /*newslist*/ 1) uutinen_changes.news = /*news*/ ctx[2];
    			uutinen.$set(uutinen_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uutinen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uutinen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uutinen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:4) {#each newslist as news}",
    		ctx
    	});

    	return block;
    }

    // (28:19)      <p>odotellaan</p>   {:then newslist}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "odotellaan";
    			add_location(p, file$2, 28, 4, 520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(28:19)      <p>odotellaan</p>   {:then newslist}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*newslist*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "news svelte-1xg8zc5");
    			add_location(div, file$2, 26, 0, 477);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*newslist*/ 1 && promise !== (promise = /*newslist*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Uutiset', slots, []);
    	let { newsclass } = $$props;
    	let newslist = getAllNews;
    	newslist.then(console.log(newslist));
    	const writable_props = ['newsclass'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Uutiset> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('newsclass' in $$props) $$invalidate(1, newsclass = $$props.newsclass);
    	};

    	$$self.$capture_state = () => ({
    		getAllNews,
    		getEntNews,
    		getSportNews,
    		Uutinen,
    		newsclass,
    		newslist
    	});

    	$$self.$inject_state = $$props => {
    		if ('newsclass' in $$props) $$invalidate(1, newsclass = $$props.newsclass);
    		if ('newslist' in $$props) $$invalidate(0, newslist = $$props.newslist);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*newsclass*/ 2) {
    			{
    				switch (newsclass) {
    					case 'Uutiset':
    						$$invalidate(0, newslist = getAllNews);
    						break;
    					case 'Urheilu':
    						$$invalidate(0, newslist = getSportNews);
    						break;
    					case 'Viihde':
    						$$invalidate(0, newslist = getEntNews);
    						break;
    				}
    			}
    		}
    	};

    	return [newslist, newsclass];
    }

    class Uutiset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { newsclass: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Uutiset",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*newsclass*/ ctx[1] === undefined && !('newsclass' in props)) {
    			console_1.warn("<Uutiset> was created without expected prop 'newsclass'");
    		}
    	}

    	get newsclass() {
    		throw new Error("<Uutiset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set newsclass(value) {
    		throw new Error("<Uutiset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.46.4 */

    const file$1 = "src/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let small;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			small = element("small");
    			small.textContent = "Site made by Juho Ristolainen";
    			add_location(small, file$1, 1, 2, 11);
    			attr_dev(footer, "class", "svelte-1tpniok");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, small);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let navbar;
    	let updating_newsclass;
    	let t0;
    	let h1;
    	let t3;
    	let div;
    	let uutiset;
    	let t4;
    	let footer;
    	let current;

    	function navbar_newsclass_binding(value) {
    		/*navbar_newsclass_binding*/ ctx[2](value);
    	}

    	let navbar_props = {};

    	if (/*newsclass*/ ctx[0] !== void 0) {
    		navbar_props.newsclass = /*newsclass*/ ctx[0];
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, 'newsclass', navbar_newsclass_binding));

    	uutiset = new Uutiset({
    			props: { newsclass: /*newsclass*/ ctx[0] },
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = `salaisuus: ${/*salaisuus*/ ctx[1]}`;
    			t3 = space();
    			div = element("div");
    			create_component(uutiset.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(header, file, 11, 2, 222);
    			add_location(h1, file, 15, 2, 318);
    			attr_dev(div, "class", "newslist svelte-6jvmoe");
    			add_location(div, file, 16, 2, 352);
    			add_location(main, file, 10, 0, 213);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			mount_component(navbar, header, null);
    			append_dev(main, t0);
    			append_dev(main, h1);
    			append_dev(main, t3);
    			append_dev(main, div);
    			mount_component(uutiset, div, null);
    			append_dev(main, t4);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};

    			if (!updating_newsclass && dirty & /*newsclass*/ 1) {
    				updating_newsclass = true;
    				navbar_changes.newsclass = /*newsclass*/ ctx[0];
    				add_flush_callback(() => updating_newsclass = false);
    			}

    			navbar.$set(navbar_changes);
    			const uutiset_changes = {};
    			if (dirty & /*newsclass*/ 1) uutiset_changes.newsclass = /*newsclass*/ ctx[0];
    			uutiset.$set(uutiset_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(uutiset.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(uutiset.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(uutiset);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let newsclass = 'Uutiset';
    	let salaisuus = process.env.NEWS_URL;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function navbar_newsclass_binding(value) {
    		newsclass = value;
    		$$invalidate(0, newsclass);
    	}

    	$$self.$capture_state = () => ({
    		Navbar,
    		Uutiset,
    		Footer,
    		newsclass,
    		salaisuus
    	});

    	$$self.$inject_state = $$props => {
    		if ('newsclass' in $$props) $$invalidate(0, newsclass = $$props.newsclass);
    		if ('salaisuus' in $$props) $$invalidate(1, salaisuus = $$props.salaisuus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [newsclass, salaisuus, navbar_newsclass_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
