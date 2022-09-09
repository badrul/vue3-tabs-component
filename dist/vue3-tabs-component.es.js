import { ref, inject, watch, onBeforeMount, onBeforeUnmount, withDirectives, openBlock, createElementBlock, normalizeClass, renderSlot, vShow, reactive, provide, onMounted, toRefs, createElementVNode, Fragment, renderList } from "vue";
var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$1 = {
  name: "Tab",
  props: {
    panelClass: {
      type: String,
      default: "tabs-component-panel"
    },
    id: {
      type: String,
      default: null
    },
    name: {
      type: String,
      required: true
    },
    prefix: {
      type: String,
      default: ""
    },
    suffix: {
      type: String,
      default: ""
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const isActive = ref(false);
    const tabsProvider = inject("tabsProvider");
    const addTab = inject("addTab");
    const updateTab = inject("updateTab");
    const deleteTab = inject("deleteTab");
    const header = props.prefix + props.name + props.suffix;
    const computedId = props.id ? props.id : props.name.toLowerCase().replace(/ /g, "-");
    const hash = "#" + (!props.isDisabled ? computedId : "");
    watch(
      () => tabsProvider.activeTabHash,
      () => {
        isActive.value = hash === tabsProvider.activeTabHash;
      }
    );
    watch(() => Object.assign({}, props), () => {
      updateTab(computedId, {
        name: props.name,
        header: props.prefix + props.name + props.suffix,
        isDisabled: props.isDisabled,
        hash,
        index: tabsProvider.tabs.length,
        computedId
      });
    });
    onBeforeMount(() => {
      addTab({
        name: props.name,
        header,
        isDisabled: props.isDisabled,
        hash,
        index: tabsProvider.tabs.length,
        computedId
      });
    });
    onBeforeUnmount(() => {
      deleteTab(computedId);
    });
    return {
      header,
      computedId,
      hash,
      isActive
    };
  }
};
const _hoisted_1$1 = ["id", "aria-hidden"];
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return withDirectives((openBlock(), createElementBlock("section", {
    id: $setup.computedId,
    ref: "tab",
    "aria-hidden": !$setup.isActive,
    class: normalizeClass($props.panelClass),
    role: "tabpanel"
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 10, _hoisted_1$1)), [
    [vShow, $setup.isActive]
  ]);
}
var Tab = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1]]);
class ExpiringStorage {
  get(key) {
    const cached = JSON.parse(
      localStorage.getItem(key)
    );
    if (!cached) {
      return null;
    }
    const expires = new Date(cached.expires);
    if (expires < new Date()) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.value;
  }
  set(key, value, lifeTimeInMinutes) {
    const currentTime = new Date().getTime();
    const expires = new Date(currentTime + lifeTimeInMinutes * 6e4);
    localStorage.setItem(key, JSON.stringify({ value, expires }));
  }
}
var expiringStorage = new ExpiringStorage();
const _sfc_main = {
  props: {
    cacheLifetime: {
      type: Number,
      default: 5
    },
    options: {
      type: Object,
      required: false,
      default: () => ({
        useUrlFragment: true,
        defaultTabHash: null,
        id: ""
      })
    },
    wrapperClass: {
      type: String,
      default: "tabs-component"
    },
    panelsWrapperClass: {
      type: String,
      default: "tabs-component-panels"
    },
    navClass: {
      type: String,
      default: "tabs-component-tabs"
    },
    navItemClass: {
      type: String,
      default: "tabs-component-tab"
    },
    navItemDisabledClass: {
      type: String,
      default: "is-disabled"
    },
    navItemActiveClass: {
      type: String,
      default: "is-active"
    },
    navItemLinkClass: {
      type: String,
      default: "tabs-component-tab-a"
    },
    navItemLinkActiveClass: {
      type: String,
      default: "is-active"
    },
    navItemLinkDisabledClass: {
      type: String,
      default: "is-disabled"
    }
  },
  emits: ["changed", "clicked"],
  setup(props, context) {
    const state = reactive({
      activeTabHash: "",
      lastActiveTabHash: "",
      tabs: []
    });
    provide("tabsProvider", state);
    provide("addTab", (tab) => {
      state.tabs.push(tab);
    });
    provide("updateTab", (computedId, data) => {
      let tabIndex = state.tabs.findIndex((tab) => tab.computedId === computedId);
      data.isActive = state.tabs[tabIndex].isActive;
      state.tabs[tabIndex] = data;
    });
    provide("deleteTab", (computedId) => {
      let tabIndex = state.tabs.findIndex((tab) => tab.computedId === computedId);
      state.tabs.splice(tabIndex, 1);
    });
    const selectTab = (selectedTabHash, event) => {
      if (event && !props.options.useUrlFragment) {
        event.preventDefault();
      }
      const selectedTab = findTab(selectedTabHash);
      if (!selectedTab) {
        return;
      }
      if (event && selectedTab.isDisabled) {
        event.preventDefault();
        return;
      }
      if (state.lastActiveTabHash === selectedTab.hash) {
        context.emit("clicked", { tab: selectedTab });
        return;
      }
      state.tabs.forEach((tab) => {
        tab.isActive = tab.hash === selectedTab.hash;
      });
      context.emit("changed", { tab: selectedTab });
      state.lastActiveTabHash = state.activeTabHash = selectedTab.hash;
      const storageKey = `vue-tabs-component.cache.${window.location.host}${window.location.pathname}`;
      expiringStorage.set(storageKey, selectedTab.hash, props.cacheLifetime);
    };
    const findTab = (hash) => {
      return state.tabs.find((tab) => tab.hash === hash);
    };
    onMounted(() => {
      if (!state.tabs.length) {
        return;
      }
      window.addEventListener("hashchange", () => selectTab(window.location.hash));
      if (findTab(window.location.hash)) {
        selectTab(window.location.hash);
        return;
      }
      const storageKey = `vue-tabs-component.cache.${props.options.id}${window.location.host}${window.location.pathname}`;
      const previousSelectedTabHash = expiringStorage.get(storageKey);
      if (findTab(previousSelectedTabHash)) {
        selectTab(previousSelectedTabHash);
        return;
      }
      if (props.options.defaultTabHash && findTab("#" + props.options.defaultTabHash)) {
        selectTab("#" + props.options.defaultTabHash);
        return;
      }
      selectTab(state.tabs[0].hash);
    });
    return {
      ...toRefs(state),
      selectTab,
      findTab
    };
  }
};
const _hoisted_1 = ["aria-controls", "aria-selected", "href", "onClick", "innerHTML"];
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: normalizeClass($props.wrapperClass)
  }, [
    createElementVNode("ul", {
      role: "tablist",
      class: normalizeClass($props.navClass)
    }, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.tabs, (tab, i) => {
        return openBlock(), createElementBlock("li", {
          key: i,
          class: normalizeClass([$props.navItemClass, tab.isDisabled ? $props.navItemDisabledClass : "", tab.isActive ? $props.navItemActiveClass : ""]),
          role: "presentation"
        }, [
          createElementVNode("a", {
            role: "tab",
            class: normalizeClass([$props.navItemLinkClass, tab.isDisabled ? $props.navItemLinkDisabledClass : "", tab.isActive ? $props.navItemLinkActiveClass : ""]),
            "aria-controls": tab.hash,
            "aria-selected": tab.isActive,
            href: tab.hash,
            onClick: ($event) => $setup.selectTab(tab.hash, $event),
            innerHTML: tab.header
          }, null, 10, _hoisted_1)
        ], 2);
      }), 128))
    ], 2),
    createElementVNode("div", {
      class: normalizeClass($props.panelsWrapperClass)
    }, [
      renderSlot(_ctx.$slots, "default")
    ], 2)
  ], 2);
}
var Tabs = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
var index = {
  install(Vue) {
    Vue.component("tab", Tab);
    Vue.component("tabs", Tabs);
  }
};
export { Tab, Tabs, index as default };
