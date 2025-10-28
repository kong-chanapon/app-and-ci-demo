# Helm Chart Example Structure

คุณจะต้องสร้าง repository แยกสำหรับ Helm chart ที่มีโครงสร้างดังนี้:

```
nodejs-demo-chart/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml (optional)
    └── configmap.yaml (optional)
```

## Chart.yaml
```yaml
apiVersion: v2
name: nodejs-demo
description: A Helm chart for Node.js demo application
type: application
version: 0.1.0
appVersion: "1.0.0"
```

## values.yaml
```yaml
replicaCount: 2

image:
  repository: your-dockerhub-username/nodejs-demo
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: NodePort
  port: 80
  targetPort: 3000
  nodePort: 30080

env:
  - name: NODE_ENV
    value: "production"
  - name: APP_VERSION
    value: "1.0.0"

ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: demo.local
      paths:
        - path: /
          pathType: Prefix
  tls: []

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80

nodeSelector: {}
tolerations: []
affinity: {}
```

## templates/deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "nodejs-demo.fullname" . }}
  labels:
    {{- include "nodejs-demo.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "nodejs-demo.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "nodejs-demo.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 3000
              protocol: TCP
          env:
            {{- toYaml .Values.env | nindent 12 }}
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

## templates/service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "nodejs-demo.fullname" . }}
  labels:
    {{- include "nodejs-demo.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
      {{- if eq .Values.service.type "NodePort" }}
      nodePort: {{ .Values.service.nodePort }}
      {{- end }}
  selector:
    {{- include "nodejs-demo.selectorLabels" . | nindent 4 }}
```

## Helper Templates (_helpers.tpl)
```yaml
{{- define "nodejs-demo.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "nodejs-demo.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "nodejs-demo.labels" -}}
helm.sh/chart: {{ include "nodejs-demo.chart" . }}
{{ include "nodejs-demo.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "nodejs-demo.selectorLabels" -}}
app.kubernetes.io/name: {{ include "nodejs-demo.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "nodejs-demo.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}
```

คุณต้องสร้าง repository ใหม่บน GitHub ชื่อ `nodejs-demo-chart` และอัพโหลดไฟล์เหล่านี้ไป แล้วปรับ URL ใน Jenkinsfile ให้ตรงกับ repository ของคุณ