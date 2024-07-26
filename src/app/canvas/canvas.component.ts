import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  TemplateRef,
} from '@angular/core';
import { fabric } from 'fabric';
import { HttpService } from '../services/http.service';
import { AppConstant } from '../services/app.constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../services/toast.service';
import { ActivatedRoute } from '@angular/router';

interface RectangleData {
  startPoint: fabric.Point;
  endPoint: fabric.Point;
  width: number;
  height: number;
  area: number;
  labelText: string;
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('content', { static: true })
  content!: ElementRef<HTMLCanvasElement>;
  imgElement = document.getElementsByClassName('background-image');
  private canvas!: fabric.Canvas;
  private isDrawing: boolean = false;
  private rectanglesStore: RectangleData[] = [];
  private isMovingRect: boolean = false; // Flag to indicate if we are moving an existing rectangle
  private startPoint: fabric.Point | null = null;
  private currentRect: fabric.Rect | null = null;
  public label: fabric.Text | null = null;
  private isMovingRectStarted: boolean = false;
  private labels: fabric.Text[] = [];
  rectangleName: string = '';
  private rectLabelMap: { [key: string]: fabric.Text | null } = {};

  private labelFontWeight: number = 5;
  private labelFontSize: number = 10;

  currentHeight: number = 0;
  currentWidth: number = 0;

  // for drawing rectangle as user input
  startingX: any;
  startingY: any;
  rectangleWidth: any;
  rectangleHeight: any;
  nextRectangleId: number = 1;

  paperTypePatternData: any[] = [];
  areaMetaMst: any[] = [];
  fileUrl: string = '';
  private modalService = inject(NgbModal);
  // private toastService = inject(NgbToast);
  is_area: string = '1';
  is_type: string = '0';
  paper_area_name: string = '';
  paper_field_name: string = '';
  toasts: any[] = [];
  paperBlockArea: any[] = [];
  paperAreaMeta: any[] = [];
  paper_block_area_id: string = '';
  paper_type_version_code: string | null = '';
  selectedData: any;
  previewLoading: boolean = false;
  submitLoading: boolean = false;
  deleteLoading: boolean = false;

  constructor(
    private http: HttpService,
    public toastService: ToastService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe((params) => {
      if (params) {
        this.paper_type_version_code = params.get('paper_type_version_code');
        const result = this.activatedRoute.snapshot.data['data'];
        if (result && result.success == AppConstant.App_Constant.RESPONSE_YES) {
          this.paperTypePatternData = result.responseData.paperTypePatternData;
          if (this.paperTypePatternData.length > 0) {
            this.fileUrl =
              AppConstant.App_Constant.FILE_URL +
              this.paperTypePatternData[0].bg_file;
          }
          this.areaMetaMst = result.responseData.areaMetaMst;
        }
      }
    });
  }

  openModal() {
    this.modalService
      .open(this.content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          //console.log("lalabhai result")
        },
        (reason) => {
          this.deleteAllRectangles();
        }
      );
  }

  // getVersionData() {
  //   let requestJSON = '{"paper_type_version_code":"'+this.paper_type_version_code+'"}';
  //   let fd = new FormData();
  //   fd.append('action', AppConstant.App_Action.GET_PAPERTYPE_VERSION);
  //   fd.append('is_block_area', 'true');
  //   fd.append('requestJSON', requestJSON);
  //   this.http.httpCall(fd).subscribe((result) => {
  //     if (result.success == AppConstant.App_Constant.RESPONSE_YES) {
  //       this.paperTypePatternData = result.responseData.paperTypePatternData;
  //       if (this.paperTypePatternData.length > 0) {
  //         this.fileUrl =
  //           AppConstant.App_Constant.FILE_URL +
  //           this.paperTypePatternData[0].bg_file;
  //       }
  //       this.areaMetaMst = result.responseData.areaMetaMst;
  //     }
  //   });
  // }

  getAreaWithMeta() {
    this.previewLoading = true;
    let requestJSON =
      '{"paper_type_version_code":"' + this.paper_type_version_code + '"}';
    let fd = new FormData();
    fd.append('action', AppConstant.App_Action.GET_BLOCK_AREA_META);
    fd.append('is_block_area', 'true');
    fd.append('requestJSON', requestJSON);
    this.http.httpCall(fd).subscribe((result) => {
      if (result.success == AppConstant.App_Constant.RESPONSE_YES) {
        this.paperBlockArea = result.responseData.paperBlockArea;
        this.paperAreaMeta = result.responseData.paperAreaMeta;
        this.deleteAllRectangles();
        this.previewLoading = false;
        this.paperBlockArea.forEach((area) => {
          const point = new fabric.Point(
            Number(area.paper_area_left),
            Number(area.paper_area_top)
          );
          const areaRect = new fabric.Rect({
            left: point.x,
            top: point.y,
            width: Number(area.paper_area_width),
            height: Number(area.paper_area_height),
            fill: 'transparent',
            stroke: 'green',
            strokeDashArray: [5, 5],
            strokeWidth: 2,
            name: area.paper_area_name,
            hoverCursor: 'default', // Set cursor to default when hovering
            moveCursor: 'default',
            data: { id: area.id, is_area: 1 },
          });
          this.canvas.add(areaRect);
          this.showLabel(areaRect, area.paper_area_name);
        });

        this.paperAreaMeta.forEach((meta) => {
          const raw = this.getRowByKey(this.areaMetaMst, meta.paper_field_name);
          const name = raw.value;
          const point = new fabric.Point(
            Number(meta.paper_field_left),
            Number(meta.paper_field_top)
          );
          const metaRect = new fabric.Rect({
            left: point.x,
            top: point.y,
            width: Number(meta.paper_field_width),
            height: Number(meta.paper_field_height),
            fill: 'transparent',
            stroke: 'blue',
            strokeDashArray: [5, 5],
            strokeWidth: 2,
            name: meta.id,
            hoverCursor: 'default',
            moveCursor: 'default',
            data: { id: meta.id, is_area: 0 },
          });
          this.canvas.add(metaRect);
          this.showLabel(metaRect, name);
        });
      }
    });
  }

  getRowByKey(data: any[], key: number): any {
    return data.find((row) => row.key === key);
  }

  ngAfterViewInit() {
    const imgElement = document.querySelector(
      '.background-image'
    ) as HTMLImageElement;
    imgElement.addEventListener('load', () => {
      this.canvasRef.nativeElement.width = imgElement.width;
      this.canvasRef.nativeElement.height = imgElement.height;
      this.canvasRef.nativeElement.style.border = '1px solid black';

      this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
        isDrawingMode: false,
      });
      this.getAreaWithMeta();
      this.canvas.setBackgroundImage(
        imgElement.src,
        this.canvas.renderAll.bind(this.canvas)
      );

      this.canvas.on('mouse:down', (options: fabric.IEvent) => {
        this.onMouseDown(options);
        console.log('down');
      });

      this.canvas.on('mouse:move', (options: fabric.IEvent) => {
        this.onMouseMove(options);
        console.log('move');
      });

      this.canvas.on('mouse:up', (options: fabric.IEvent) => {
        this.onMouseUp(options);
        console.log('up');
      });
    });
  }

  getStartPoint(): fabric.Point | null {
    return this.startPoint;
  }

  updateDimensions() {
    if (this.currentRect) {
      this.currentHeight = Math.abs(this.currentRect?.height ?? 0);
      this.currentWidth = Math.abs(this.currentRect?.width ?? 0);
    } else {
      this.currentHeight = 0;
      this.currentWidth = 0;
    }
  }

  promptForRectangleName(): string {
    //const name = window.prompt('Please name the rectangle:');
    // return name || '';
    if (this.is_area == '1') {
      return this.paper_area_name;
    }
    return this.paper_field_name;
  }

  // rectangleName = window.prompt("please name the rectangle");
  showLabel(rect: fabric.Rect, labelText: string) {
    const rectCenter = rect.getCenterPoint();

    if (rect.width !== 0 && rect.height !== 0) {
      const newlabel = new fabric.Text(labelText, {
        left: rectCenter.x,
        top: rectCenter.y,
        fontSize: this.labelFontSize,
        fontWeight: this.labelFontWeight,
        originX: 'center',
        originY: 'bottom',
        fill: 'blue',
      });
      this.canvas.add(newlabel);

      // Store the label in the rectLabelMap
      this.rectLabelMap[rect.name || ''] = newlabel;
    }
  }

  onMouseDown(options: fabric.IEvent) {
    if (options.target && options.target.type === 'rect') {
      // Mouse is over an existing rectangle, set the flag to true
      this.isMovingRect = true;
      this.currentRect = options.target as fabric.Rect;

      this.label = this.rectLabelMap[this.currentRect.name || ''];
      this.selectedData = this.currentRect.data;
      this.startPoint = this.currentRect.getCenterPoint();

      this.canvas.add(this.currentRect);
      // this.showLabel(this.currentRect);
    } else {
      // Mouse is not over an existing rectangle, create a new one
      this.isDrawing = true;
      const pointer = this.canvas.getPointer(options.e);
      this.startPoint = new fabric.Point(pointer.x, pointer.y);
      this.currentRect = new fabric.Rect({
        left: this.startPoint.x,
        top: this.startPoint.y,
        width: 0,
        height: 0,
        fill: 'transparent',
        stroke: 'black',
        strokeDashArray: [5, 5],
        strokeWidth: 2,
        name: this.rectangleName,
      });

      // if (this.label) {
      //   this.canvas.add(this.label);
      // }

      // this.showLabel(this.currentRect);
      this.rectLabelMap[this.rectangleName] = this.label;
      this.canvas.add(this.currentRect);
      this.updateDimensions();
    }
  }

  deleteAreaWithMeta() {
    if (this.selectedData && this.selectedData.id) {
      let result = confirm('Are you sure you want to delete this?');
      if (result) {
        this.deleteLoading = true;
        let requestJSON =
          '{"id":"' +
          this.selectedData.id +
          '","is_area":"' +
          this.selectedData.is_area +
          '"}';
        let fd = new FormData();
        fd.append('action', AppConstant.App_Action.DELETE_BLOCK_AREA_WITH_META);
        fd.append('is_block_area', 'true');
        fd.append('requestJSON', requestJSON);
        this.http.httpCall(fd).subscribe((result) => {
          this.deleteLoading = false;
          if (result.success == AppConstant.App_Constant.RESPONSE_YES) {
            this.toastService.show(result.message);
            this.getAreaWithMeta();
          }
        });
      }
    }
  }

  onMouseMove(options: fabric.IEvent) {
    //console.log('onMouseMove', options);
    if (this.isMovingRect) {
      //console.log('onMouseMove - isMovingRect', this.isMovingRect);
      // Existing rectangle is being moved, update its position and label
      const pointer = this.canvas.getPointer(options.e);
      const deltaX = pointer.x - this.startPoint!.x;
      const deltaY = pointer.y - this.startPoint!.y;

      const newLeft = this.currentRect!.left! + deltaX;
      const newTop = this.currentRect!.top! + deltaY;
      const canvasWidth = this.canvasRef.nativeElement.width;
      const canvasHeight = this.canvasRef.nativeElement.height;
      const rectWidth = this.currentRect!.width!;
      const rectHeight = this.currentRect!.height!;

      // Check if the new position is inside the canvas boundary
      if (
        newLeft >= 0 &&
        newTop >= 0 &&
        newLeft + rectWidth <= canvasWidth &&
        newTop + rectHeight <= canvasHeight
      ) {
        this.currentRect!.set({
          left: newLeft,
          top: newTop,
        });

        // Update label position along with the rectangle
        const rectCenter = this.currentRect!.getCenterPoint();
        if (this.label) {
          this.label.set({ left: rectCenter.x, top: rectCenter.y });
        }

        // Find if, that the corresponding label for the moving rectangle
        const correspondingLabel =
          this.rectLabelMap[this.currentRect?.name ?? ''];

        if (correspondingLabel) {
          correspondingLabel.set({ left: rectCenter.x, top: rectCenter.y });
        }

        this.canvas.renderAll();
      }
    } else if (this.isDrawing) {
      console.log('onMouseMove - isDrawing', this.isDrawing);
      // If drawing a new rectangle, update its size
      const pointer = this.canvas.getPointer(options.e);
      const canvasWidth = this.canvasRef.nativeElement.width;
      const canvasHeight = this.canvasRef.nativeElement.height;

      let rectLeft = Math.min(this.startPoint!.x, pointer.x);
      let rectTop = Math.min(this.startPoint!.y, pointer.y);
      let rectWidth = Math.abs(pointer.x - this.startPoint!.x);
      let rectHeight = Math.abs(pointer.y - this.startPoint!.y);

      // Make sure the rectangle stays inside the canvas boundaries
      if (rectLeft < 0) {
        rectWidth += rectLeft;
        rectLeft = 0;
      }
      if (rectTop < 0) {
        rectHeight += rectTop;
        rectTop = 0;
      }
      if (rectLeft + rectWidth > canvasWidth) {
        rectWidth = canvasWidth - rectLeft;
      }
      if (rectTop + rectHeight > canvasHeight) {
        rectHeight = canvasHeight - rectTop;
      }

      const isOverlap = this.checkForRectangleOverlap(
        rectLeft,
        rectTop,
        rectWidth,
        rectHeight
      );

      if (this.currentRect && rectWidth > 0 && rectHeight > 0 && !isOverlap) {
        this.currentRect.set({
          left: rectLeft,
          top: rectTop,
          width: rectWidth,
          height: rectHeight,
        });
        // this.showLabel(this.currentRect);

        const rectCenter = this.currentRect.getCenterPoint();
        if (this.label) {
          this.label.set({ left: rectCenter.x, top: rectCenter.y });
        }

        this.canvas.renderAll();

        this.currentHeight = Math.abs(rectHeight);
        this.currentWidth = Math.abs(rectWidth);
      }

      this.updateDimensions();
    }
  }

  onMouseUp(options: fabric.IEvent) {
    if (this.isMovingRect) {
      // Mouse was used to move the rectangle, reset the flag
      this.isMovingRect = false;
      this.isMovingRectStarted = false;
    } else {
      // Mouse was used to create a new rectangle, set the flag to false
      this.isDrawing = false;
      this.isMovingRectStarted = false;
      this.updateDimensions();

      // Check if the rectangle has a non-zero width and height
      if (this.currentWidth !== 0 && this.currentHeight !== 0) {
        if (this.currentRect && this.startPoint) {
          const endPoint = new fabric.Point(
            this.startPoint.x + this.currentWidth,
            this.startPoint.y + this.currentHeight
          );
          const area = this.currentWidth * this.currentHeight;
          const labelText = this.promptForRectangleName(); // Get label text
          //const labelText = ''; // Get label text
          const newRectangle: RectangleData = {
            startPoint: this.startPoint,
            endPoint: endPoint,
            width: this.currentWidth,
            height: this.currentHeight,
            area: area,
            labelText: labelText, // Store label text
          };
          this.openModal();

          this.showLabel(this.currentRect, labelText);
          this.rectanglesStore.push(newRectangle);
        }
      }
    }
  }

  checkForRectangleOverlap(
    newLeft: number,
    newTop: number,
    newWidth: number,
    newHeight: number
  ): boolean {
    // Loop through the existing rectangles and check for overlap with the new rectangle
    for (const existingRect of this.rectanglesStore) {
      const existingLeft = existingRect.startPoint.x;
      const existingTop = existingRect.startPoint.y;
      const existingWidth = existingRect.width;
      const existingHeight = existingRect.height;

      // Check if the new rectangle overlaps the existing rectangle
      const isOverlap =
        newLeft + newWidth >= existingLeft &&
        newLeft <= existingLeft + existingWidth &&
        newTop + newHeight >= existingTop &&
        newTop <= existingTop + existingHeight;

      if (isOverlap) {
        return true; // Return true if there's an overlap
      }
    }

    return false; // Return false if no overlap is found
  }

  drawUserRectangle() {
    const startX = this.startingX;
    const startY = this.startingY;
    const height = this.rectangleHeight;
    const width = this.rectangleWidth;
    const labelText = this.promptForRectangleName();

    // Create a new label for the rectangle
    const label = new fabric.Text(labelText, {
      left: startX + width / 2,
      top: startY + height / 2,
      fontSize: this.labelFontSize,
      fontWeight: this.labelFontWeight,
    });

    // Draw the rectangle with the label
    this.drawRectangle(height, width, startX, startY, label);
  }

  removeRectanglesFromCanvas() {
    const objects = this.canvas.getObjects();
    objects.forEach((object) => {
      if (object.type === 'rect') {
        this.canvas.remove(object);
      }
    });
  }

  // for clearing all the objects on the canvas
  deleteAllRectangles() {
    // Clear the rectanglesStore array
    this.rectanglesStore = [];
    this.selectedData=null;
    // Remove all rectangles from the canvas
    this.removeRectanglesFromCanvas();

    // Remove all labels from the canvas
    this.removeLabelsFromCanvas();

    // Clear the currentRect and startPoint
    this.currentRect = null;
    this.startPoint = null;

    // Clear the dimensions and label
    this.currentHeight = 0;
    this.currentWidth = 0;
    if (this.label) {
      this.canvas.remove(this.label);
      this.label = null;
    }
  }
  // for clearing all the lables of the recatngle
  removeLabelsFromCanvas() {
    for (const i in this.rectLabelMap) {
      if (this.rectLabelMap.hasOwnProperty(i)) {
        const label = this.rectLabelMap[i];
        if (label) {
          this.canvas.remove(label);
        }
      }
    }
    this.rectLabelMap = {};
  }

  drawRectangle(
    height: number,
    width: number,
    startX: number,
    startY: number,
    label: fabric.Text
  ) {
    this.currentRect = new fabric.Rect({
      left: startX,
      top: startY,
      width: width,
      height: height,
      fill: 'transparent',
      stroke: 'black',
      strokeDashArray: [5, 5],
      strokeWidth: 2,
    });

    // Add the rectangle and its label to the canvas
    this.canvas.add(this.currentRect, label);

    this.currentHeight = Math.abs(height);
    this.currentWidth = Math.abs(width);

    this.startPoint = new fabric.Point(startX, startY);

    this.canvas.renderAll();
  }

  submitArea() {
    let requestJSON =
      '{"paper_type_code":"' +
      this.paperTypePatternData[0].paper_type_code +
      '","paper_type_version_code":"' +
      this.paperTypePatternData[0].paper_type_version_code +
      '","is_area":"' +
      this.is_area +
      '","paper_area_name":"' +
      this.paper_area_name +
      '","paper_field_name":"' +
      this.paper_field_name +
      '","x":"' +
      this.startPoint?.x +
      '","y":"' +
      this.startPoint?.y +
      '","height":"' +
      this.currentHeight +
      '","width":"' +
      this.currentWidth +
      '","type":"' +
      this.is_type +
      '","paper_block_area_id":"' +
      this.paper_block_area_id +
      '"}';
    this.submitLoading = true;
    let fd = new FormData();
    fd.append('action', AppConstant.App_Action.ADD_BLOCK_AREA_WITH_META);
    fd.append('is_block_area', 'true');
    fd.append('requestJSON', requestJSON);
    this.http.httpCall(fd).subscribe((result) => {
      if (result.success == AppConstant.App_Constant.RESPONSE_YES) {
        this.modalService.dismissAll();
        this.toastService.show(result.message);
        this.getAreaWithMeta();
      }
      this.submitLoading = false;
    });
  }
}
