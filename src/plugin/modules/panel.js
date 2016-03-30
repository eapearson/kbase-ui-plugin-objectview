/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb/common/html',
    'kb/widget/widgetSet',
    './utils'
],
    function (html, WidgetSet, utils) {
        'use strict';

        function renderBSCollapsiblePanel(config) {
            var div = html.tag('div'),
                span = html.tag('span'),
                h4 = html.tag('h4'),
                panelId = html.genId(),
                headingId = html.genId(),
                collapseId = html.genId();

            return div({class: 'panel-group kb-widget', id: panelId, role: 'tablist', 'aria-multiselectable': 'true'}, [
                div({class: 'panel panel-default'}, [
                    div({class: 'panel-heading', role: 'tab', id: headingId}, [
                        h4({class: 'panel-title'}, [
                            span({'data-toggle': 'collapse', 'data-parent': '#' + panelId, 'data-target': '#' + collapseId, 'aria-expanded': 'false', 'aria-controls': collapseId, class: 'collapsed', style: {cursor: 'pointer'}}, [
                                span({class: 'fa fa-' + config.icon + ' fa-rotate-90', style: {'margin-left': '10px', 'margin-right': '10px'}}),
                                config.title
                            ])
                        ])
                    ]),
                    div({class: 'panel-collapse collapse', id: collapseId, role: 'tabpanel', 'aria-labelledby': 'provHeading'}, [
                        div({class: 'panel-body'}, [
                            config.content
                        ])
                    ])
                ])
            ]);
        }

        function factory(config) {
            var mount, container, runtime = config.runtime,
                widgetSet = WidgetSet.make({runtime: runtime}),
                rendered;

            function renderPanel() {
                var div = html.tag('div');
                return div({class: 'kbase-view kbase-dataview-view container-fluid', 'data-kbase-view': 'dataview'}, [
                    div({class: 'row'}, [
                        div({class: 'col-sm-12'}, [
                            div({id: widgetSet.addWidget('kb_objectview_download')})
                        ]),
                        div({class: 'col-sm-12'}, [
                            div({id: widgetSet.addWidget('kb_objectview_copy')})
                        ]),
                        div({class: 'col-sm-12'}, [
                            div({id: widgetSet.addWidget('kb_objectview_overview')}),
                            renderBSCollapsiblePanel({
                                title: 'Data Provenance and Reference Network',
                                icon: 'sitemap',
                                content: div({id: widgetSet.addWidget('kb_objectview_provenance')})
                            })
                            // div({id: widgetSet.addWidget('kb_dataview_dataObjectVisualizer')})
                        ])
                    ])
                ]);
            }

            function init(config) {
                rendered = renderPanel();
                return widgetSet.init(config);
            }

            function attach(node) {
                mount = node;
                container = document.createElement('div');
                mount.appendChild(container);
                container.innerHTML = rendered;
                return widgetSet.attach(node);
            }

            function start(params) {
                return utils.getObjectInfo(runtime, params)
                    .then(function (objectInfo) {
                        runtime.send('ui', 'setTitle', 'Data View for ' + objectInfo.name);
                        return objectInfo;
                    })
                    .then(function (objectInfo) {
                        params.objectInfo = objectInfo;
                        return widgetSet.start(params);
                        return objectInfo;
                    })
                    .then(function (objectInfo) {
                        runtime.send('ui', 'addButton', {
                            name: 'downloadObject',
                            label: 'Download',
                            style: 'default',
                            icon: 'download',
                            toggle: true,
                            params: {
                                ref: objectInfo.ref
                            },
                            callback: function () {
                                runtime.send('downloadWidget', 'toggle');
                            }
                        });

                        runtime.send('ui', 'addButton', {
                            name: 'copyObject',
                            label: 'Copy',
                            style: 'default',
                            icon: 'copy',
                            toggle: true,
                            params: {
                                ref: objectInfo.ref
                            },
                            callback: function () {
                                runtime.send('copyWidget', 'toggle');
                            }
                        });

                    });
            }

            function run(params) {
                return widgetSet.run(params);
            }
            function stop() {
                return widgetSet.stop();
            }
            function detach() {
                return widgetSet.detach()
                    .finally(function () {
                        if (mount && container) {
                            mount.removeChild(container);
                            container.innerHTML = '';
                        }
                    });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                run: run,
                stop: stop,
                detach: detach
            };
        }

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });