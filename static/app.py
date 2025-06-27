from flask import Flask, render_template, jsonify
import random
import math

app = Flask(__name__)

def distancia(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def ponto_valido(novo_ponto, pontos_existentes, min_dist=15):
    for p in pontos_existentes:
        if distancia((novo_ponto["x"], novo_ponto["y"]), (p["x"], p["y"])) < min_dist:
            return False
    return True

def gerar_pontos(n):
    pontos = []
    tentativas_max = 1000  # Evita loop infinito
    while len(pontos) < n and tentativas_max > 0:
        tentativas_max -= 1
        x = random.randint(20, 580)
        y = random.randint(20, 380)
        cor = f"rgb({random.randint(50, 200)}, {random.randint(50, 200)}, {random.randint(50, 200)})"
        novo_ponto = {"x": x, "y": y, "cor": cor}
        if ponto_valido(novo_ponto, pontos):
            pontos.append(novo_ponto)
    return pontos

# Algoritmo otimizado: Divide and Conquer (O(n log n))
def encontrar_par_mais_proximo(pontos):
    def dist(p1, p2):
        return distancia((p1["x"], p1["y"]), (p2["x"], p2["y"]))

    def helper(px, py):
        if len(px) <= 3:
            min_d = float('inf')
            par = (0, 1)
            for i in range(len(px)):
                for j in range(i + 1, len(px)):
                    d = dist(px[i], px[j])
                    if d < min_d:
                        min_d = d
                        par = (pontos.index(px[i]), pontos.index(px[j]))
            return par, min_d

        mid = len(px) // 2
        Qx = px[:mid]
        Rx = px[mid:]
        midpoint = px[mid]["x"]
        Qy = [p for p in py if p["x"] <= midpoint]
        Ry = [p for p in py if p["x"] > midpoint]

        (par_esq, d_esq) = helper(Qx, Qy)
        (par_dir, d_dir) = helper(Rx, Ry)

        d_min = d_esq
        par_min = par_esq
        if d_dir < d_min:
            d_min = d_dir
            par_min = par_dir

        strip = [p for p in py if abs(p["x"] - midpoint) < d_min]
        for i in range(len(strip)):
            for j in range(i+1, min(i+7, len(strip))):
                d = dist(strip[i], strip[j])
                if d < d_min:
                    d_min = d
                    par_min = (pontos.index(strip[i]), pontos.index(strip[j]))

        return par_min, d_min

    px = sorted(pontos, key=lambda p: p["x"])
    py = sorted(pontos, key=lambda p: p["y"])
    par, _ = helper(px, py)
    return sorted(par)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/iniciar_fase/<int:fase>')
def iniciar_fase(fase):
    n_pontos = 50 + (fase - 1) * 10
    pontos = gerar_pontos(n_pontos)
    par_correto = encontrar_par_mais_proximo(pontos)
    return jsonify({"pontos": pontos, "parCorreto": par_correto})

if __name__ == '__main__':
    app.run(debug=True)
